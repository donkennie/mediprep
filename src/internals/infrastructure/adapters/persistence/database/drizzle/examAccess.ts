import {UserExamAccessRepository} from "../../../../../domain/examAccess/repository";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {Exam} from "../../../../../domain/exams/exam";
import {and, count, eq, ilike, inArray, ne} from "drizzle-orm";
import * as schemaExam from "../../../../../../../stack/drizzle/schema/exams";
import {Exams, Questions} from "../../../../../../../stack/drizzle/schema/exams";
import {PoolClient} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schemaUser from "../../../../../../../stack/drizzle/schema/users"
import {UserExamAccess as UserExamAccesses} from "../../../../../../../stack/drizzle/schema/users"
import * as schemaTest from "../../../../../../../stack/drizzle/schema/test"
import {Tests} from "../../../../../../../stack/drizzle/schema/test"
import {UnAuthorizedError} from "../../../../../../pkg/errors/customError";

export class UserExamAccessRepositoryDrizzle implements UserExamAccessRepository {
    db

    constructor(pool: PoolClient) {
        this.db = drizzle(pool, {schema: {...schemaExam, ...schemaUser, ...schemaTest}})
    }

    getExamAccessDetail = async (userId: string, examId: string): Promise<{
        exam: Exam,
        metadata: PaginationMetaData
    }> => {
        try {
            const result = await this.db.query.UserExamAccess.findFirst({
                where: and(eq(UserExamAccesses.userId, userId), eq(UserExamAccesses.examId, examId)),
                with: {
                    exam: true
                }
            })

            if (!result) {
                throw new UnAuthorizedError("User does not have access to exam")
            }
            if (new Date(result.expiryDate) < new Date()) {
                throw new UnAuthorizedError("User access to exam has lapsed")
            }
            const totalQuestions = await this.db.select({count: count()}).from(Questions).where(eq(Questions.examId, result.exam.id as string));
            //     Mock Analytics

            return {
                exam: {
                    id: result.exam.id as string,
                    name: result.exam.name as string,
                    description: result.exam.description as string,
                    subscriptionAmount: Number(result.exam.subscriptionAmount),
                    imageURL: result.exam.imageURL as string,
                    mockQuestions: result.exam.mockQuestions as number,
                    totalMockScores: result.exam.totalMockScores,
                    mocksTaken: result.exam.mocksTaken,
                    mockTestTime: result.exam.mockTestTime,
                    createdAt: result.exam.createdAt as Date,
                    updatedAt: result.exam.updatedAt as Date
                },
                metadata: {
                    totalQuestions: totalQuestions[0].count,
                    expiryDate: result.expiryDate
                }
            }

        } catch (error) {
            throw error
        }
    }

    getExams = async (filter: PaginationFilter): Promise<{ exams: Exam[]; metadata: PaginationMetaData }> => {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Exams.name, `%${filter.name}%`));
            }
    
            // Get the total count of rows for this user
            const totalResult = await this.db.select({count: count()}).from(UserExamAccesses)
                .where(eq(UserExamAccesses.userId, filter.userId as string));
            const total = totalResult[0].count;
            
            if (total <= 0) {
                return {
                    exams: [], 
                    metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
    
            // Get user's exam access records with expiry dates
            const uerows = await this.db.query.UserExamAccess.findMany({
                where: eq(UserExamAccesses.userId, filter.userId as string),
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit
            });
    
            const examIds = uerows.map((ue) => ue.examId);
            
            // Get exam details
            const rows = await this.db.query.Exams.findMany({
                where: inArray(Exams.id, examIds),
            });
    
            let exams: Exam[] = [];
            
            for await (const exam of rows) {
                // Find the user's expiry date for this exam
                const userExamAccess = uerows.find(ue => ue.examId === exam.id);
                
                const allTest = await this.db.query.Tests.findMany({
                    where: and(
                        and(eq(Tests.userId, filter.userId as string), eq(Tests.examId, exam.id as string)), 
                        ne(Tests.type, "mock")
                    ),
                    columns: {
                        score: true
                    }
                });
    
                let totalTestScore: number = 0;
                let totalTest = allTest.length;
    
                allTest.forEach((test) => {
                    totalTestScore += test.score;
                });
    
                const allMocks = await this.db.query.Tests.findMany({
                    where: and(
                        and(eq(Tests.userId, filter.userId as string), eq(Tests.examId, exam.id as string)), 
                        eq(Tests.type, "mock")
                    ),
                    columns: {
                        score: true
                    }
                });
    
                let totalMockScore: number = 0;
                let totalMocks = allMocks.length;
    
                allMocks.forEach((test) => {
                    totalMockScore += test.score;
                });
    
                const toAdd: Exam = {
                    id: exam.id as string,
                    name: exam.name as string,
                    description: exam.description as string,
                    subscriptionAmount: Number(exam.subscriptionAmount),
                    imageURL: exam.imageURL as string,
                    createdAt: exam.createdAt as Date,
                    updatedAt: exam.updatedAt as Date,
                    testAveragePercent: totalTest > 0 ? totalTestScore / totalTest : 0,
                    mockAveragePercent: totalMocks > 0 ? totalMockScore / totalMocks : 0,
                    totalMockScores: exam.totalMockScores,
                    mocksTaken: exam.mocksTaken,
                    mockTestTime: exam.mockTestTime,
                    expiryDate: userExamAccess?.expiryDate 
                };
    
                exams.push(toAdd);
            }
    
            return {
                exams, 
                metadata: {
                    total: total,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
    
        } catch (error) {
            throw error;
        }
    }

}