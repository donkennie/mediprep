import {UserExamAccessRepository} from "../../../../../domain/examAccess/repository";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {Exam} from "../../../../../domain/exams/exam";
import {and, count, eq, gt, ilike, inArray, isNull, ne, or} from "drizzle-orm";
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

    getExams = async (
        filter: PaginationFilter
    ): Promise<{ exams: Exam[]; metadata: PaginationMetaData }> => {
        try {
            const filters: any[] = [];
            if (filter.name && filter.name.trim() !== "") {
                filters.push(ilike(Exams.name, `%${filter.name}%`));
            }
    
            const totalResult = await this.db
                .select({ count: count() })
                .from(UserExamAccesses)
                .where(eq(UserExamAccesses.userId, filter.userId as string));
    
            const total = totalResult[0].count;
    
            if (total <= 0) {
                return {
                    exams: [],
                    metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page,
                    },
                };
            }
    
            const now = new Date();
            const userExamAccessRows = await this.db.query.UserExamAccess.findMany({
                where: and(
                    eq(UserExamAccesses.userId, filter.userId as string),
                    or(
                        isNull(UserExamAccesses.expiryDate), 
                        gt(UserExamAccesses.expiryDate, now) 
                    )
                ),
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
            });
    
            if (userExamAccessRows.length === 0) {
                return {
                    exams: [],
                    metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page,
                    },
                };
            }
    
            const examIds = userExamAccessRows.map((ue) => ue.examId);
    
            const examRows = await this.db.query.Exams.findMany({
                where: inArray(Exams.id, examIds),
            });
    
            const exams: Exam[] = [];
    
            for await (const exam of examRows) {
                const userExamAccess = userExamAccessRows.find(
                    (ue) => ue.examId === exam.id
                );
    
                const allTests = await this.db.query.Tests.findMany({
                    where: and(
                        eq(Tests.userId, filter.userId as string),
                        eq(Tests.examId, exam.id as string),
                        ne(Tests.type, "mock")
                    ),
                    columns: { score: true },
                });
    
                const testScores = allTests.map((t) => t.score);
                const testAverage =
                    testScores.length > 0
                        ? testScores.reduce((a, b) => a + b, 0) / testScores.length
                        : 0;
    
                const allMocks = await this.db.query.Tests.findMany({
                    where: and(
                        eq(Tests.userId, filter.userId as string),
                        eq(Tests.examId, exam.id as string),
                        eq(Tests.type, "mock")
                    ),
                    columns: { score: true },
                });
    
                const mockScores = allMocks.map((t) => t.score);
                const mockAverage =
                    mockScores.length > 0
                        ? mockScores.reduce((a, b) => a + b, 0) / mockScores.length
                        : 0;
    
                exams.push({
                    id: exam.id as string,
                    name: exam.name as string,
                    description: exam.description as string,
                    subscriptionAmount: Number(exam.subscriptionAmount),
                    imageURL: exam.imageURL as string,
                    createdAt: exam.createdAt as Date,
                    updatedAt: exam.updatedAt as Date,
                    testAveragePercent: testAverage,
                    mockAveragePercent: mockAverage,
                    totalMockScores: exam.totalMockScores,
                    mocksTaken: exam.mocksTaken,
                    mockTestTime: exam.mockTestTime,
                    expiryDate: userExamAccess?.expiryDate,
                });
            }
    
            return {
                exams,
                metadata: {
                    total: exams.length,
                    perPage: filter.limit,
                    currentPage: filter.page,
                },
            };
        } catch (error) {
            throw error;
        }
    };
    

}