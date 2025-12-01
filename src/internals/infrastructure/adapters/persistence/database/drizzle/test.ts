import {TestRepository} from "../../../../../domain/tests/repository";
import {Test, TestAnalytics, TestMode, TestType, UserAnswer} from "../../../../../domain/tests/test";
import {Option, Question, QuestionStatus, QuestionType, QuestionWithReason} from "../../../../../domain/exams/exam";
import {PoolClient} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "../../../../../../../stack/drizzle/schema/exams";
import {
    Exams,
    Options,
    Question as QuestionT,
    Questions,
    UserQuestionRecords
} from "../../../../../../../stack/drizzle/schema/exams";
import * as schema2 from "../../../../../../../stack/drizzle/schema/test";
import {TestQuestionRecords, Tests} from "../../../../../../../stack/drizzle/schema/test";
import {and, asc, count, eq, gt, gte, inArray, isNull, lte, ne, notInArray, or, sql} from "drizzle-orm";
import {BadRequestError, NotFoundError} from "../../../../../../pkg/errors/customError";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";

export class TestRepositoryDrizzle implements TestRepository {
    db

    constructor(client: PoolClient) {
        this.db = drizzle(client, {
            schema: {
                ...schema, ...schema2
            }
        })
    }


    getTestAnalytics = async (testId: string, userId: string): Promise<{ test: Test, questions: Question[] }> => {
        try {
            const testRes = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId)),
            });
            if (!testRes) throw new NotFoundError(`no test with id ${testId}`)
            const test: Test = {
                id: testRes.id as string,
                status: testRes.status,
                userId: testRes.userId as string,
                examId: testRes.examId as string,
                type: testRes.type as TestType,
                createdAt: testRes.createdAt as Date,
                updatedAt: testRes.updatedAt as Date,
                score: testRes.score as number,
                questions: testRes.questions as number,
                correctAnswers: testRes.correctAnswers as number,
                incorrectAnswers: testRes.incorrectAnswers as number,
                unansweredQuestions: testRes.unansweredQuestions as number,
                questionMode: testRes.questionMode as TestMode,
                subjectIds: testRes.subjectIds,
                courseIds: testRes.courseIds,
                endTime: testRes.endTime as Date,
                timeLeft: testRes.timeLeft as number
            }

            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                columns: {
                    questionStatus: true,
                    questionType: true,
                    questionId: true,
                    optionId: true,
                    options: true,
                    answer: true,
                }
            })

            const questionsResult = await this.getTestQuestions(testId, userId)

            const questions = questionsResult.map((questionData) => {
                const result = testQuestionsRes.find((question) => question.questionId == questionData.id)
                if (result) {
                    questionData.questionStatus = result.questionStatus as QuestionStatus
                    if (questionData.type == "single_choice") {
                        questionData.selectedAnswer = result.optionId as string
                    } else if (questionData.type == "multiple_choice") {
                        questionData.selectedAnswer = result.options as string[]
                    } else {
                        questionData.selectedAnswer = result.answer as string
                    }
                }

                return questionData
            })

            return {test, questions}
        } catch (error) {
            throw error
        }
    }

    getTests = async (
        filter: PaginationFilter
    ): Promise<{ tests: Test[]; metadata: PaginationMetaData }> => {
    
        const filters: any[] = [];
    
        if (filter.startDate) {
            filters.push(gte(Tests.createdAt, filter.startDate as Date));
        }
    
        if (filter.endDate) {
            filters.push(lte(Tests.createdAt, filter.endDate as Date));
        }
    
        if (filter.testType) {
            filters.push(eq(Tests.type, filter.testType as string));
        }
    
        if (filter.userId) {
            filters.push(eq(Tests.userId, filter.userId as string));
        }
    
        if (filter.status) {
            filters.push(eq(Tests.status, filter.status as string));
        }
    
        const now = new Date();
        filters.push(
            or(
                isNull(Tests.endTime),      
                gt(Tests.endTime, now)      
            )
        );
    
        const totalResult = await this.db
            .select({ count: count() })
            .from(Tests)
            .where(and(...filters));
    
        const total = Number(totalResult[0]?.count ?? 0);
    
        if (total <= 0) {
            return {
                tests: [],
                metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page,
                },
            };
        }
    
        const tests = await this.db.query.Tests.findMany({
            where: and(...filters),
            limit: filter.limit,
            offset: (filter.page - 1) * filter.limit,
            orderBy: Tests.createdAt,
        });
    
        return {
            tests: tests.map((test): Test => ({
                id: test.id as string,
                status: test.status,
                userId: test.userId as string,
                examId: test.examId as string,
                type: test.type as TestType,
                createdAt: test.createdAt as Date,
                updatedAt: test.updatedAt as Date,
                score: test.score as number,
                questions: test.questions as number,
                correctAnswers: test.correctAnswers as number,
                incorrectAnswers: test.incorrectAnswers as number,
                unansweredQuestions: test.unansweredQuestions as number,
                questionMode: test.questionMode as TestMode,
                subjectIds: test.subjectIds,
                courseIds: test.courseIds,
                endTime: test.endTime as Date,
            })),
            metadata: {
                total,
                perPage: filter.limit,
                currentPage: filter.page,
            },
        };
    };
    

    getExamTestAnalytics = async (userId: string, examId: string): Promise<TestAnalytics> => {
        try {
            const allQuestions = await this.db.query.Questions.findMany({
                where: eq(Questions.examId, examId),
                columns: {
                    id: true
                }
            })
            const allTest = await this.db.query.Tests.findMany({
                where: and(and(eq(Tests.userId, userId), eq(Tests.examId, examId)), ne(Tests.type, "mock")),
                columns: {
                    score: true
                }
            })

            let totalTestScore: number = 0
            let totalTest = allTest.length

            allTest.forEach((test) => {
                totalTestScore += test.score
            })

            const allMocks = await this.db.query.Tests.findMany({
                where: and(and(eq(Tests.userId, userId), eq(Tests.examId, examId)), eq(Tests.type, "mock")),
                columns: {
                    score: true
                }
            })

            let totalMockScore: number = 0
            let totalMocks = allMocks.length

            allMocks.forEach((test) => {
                totalMockScore += test.score
            })


            const usedQuestions = await this.db.query.UserQuestionRecords.findMany({
                where: and(eq(UserQuestionRecords.userId, userId), eq(UserQuestionRecords.examId, examId)),
                columns: {
                    id: true
                }
            })

            return {
                totalQuestions: allQuestions.length,
                usedQuestions: usedQuestions.length,
                totalTest,
                testAveragePercent: totalTestScore / totalTest,
                totalMocks,
                mockAveragePercent: totalMockScore / totalMocks,
            }

        } catch (error) {
            throw error
        }
    }
    

    CreateTest = async (
        test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">
      ): Promise<{ testId: string; endTime: Date }> => {
        try {
          return await this.db.transaction(async (tx): Promise<{ testId: string; endTime: Date }> => {
            const exam = await tx.query.Exams.findFirst({
              where: eq(Exams.id, test.examId)
            });
            if (!exam) throw new BadRequestError("Exam does not exist");
      
            // Handle mock test timing and question count
            if (test.type === "mock") {
              test.questions = exam.mockQuestions as number;
              test.endTime = new Date(Date.now() + exam.mockTestTime * 60 * 1000);
            }
      
            // Prepare filters
            const filters: any[] = [];
            if (test.type === "subjectBased") {
              if (test.subjectIds?.length) filters.push(inArray(Questions.subjectId, test.subjectIds));
              else throw new BadRequestError("Pass valid subject ID");
            } else if (test.type === "courseBased") {
              if (test.courseIds?.length) filters.push(inArray(Questions.courseId, test.courseIds));
              else throw new BadRequestError("Pass valid course ID");
            } else {
              if (test.examId) filters.push(eq(Questions.examId, test.examId));
              else throw new BadRequestError("Pass valid exam ID");
            }
      
            // Exclude previously used questions if applicable
            const userQuestionsRes = await tx.query.UserQuestionRecords.findMany({
              where: and(eq(UserQuestionRecords.userId, test.userId), eq(UserQuestionRecords.examId, test.examId)),
              columns: { questionId: true }
            });
            const userQuestions = userQuestionsRes.map((q) => q.questionId);
      
            if (userQuestions.length > 0 && test.questionMode !== "all") {
              if (test.questionMode === "used") filters.push(inArray(Questions.id, userQuestions));
              else filters.push(notInArray(Questions.id, userQuestions));
            }
      
            // Fetch random questions ONCE
            const questionsRes = await tx.query.Questions.findMany({
              where: and(...filters),
              columns: {
                id: true,
                type: true,
                subjectId: true,
                courseId: true,
                examId: true
              },
              limit: Math.min(
                Number(test.questions) || 0,
                Number(exam.mockQuestions) || Number(test.questions) || 0
              ),
              orderBy: sql`RANDOM()`
            });
      
            if (!questionsRes.length) throw new NotFoundError("No questions found for this test");
      
            test.questions = questionsRes.length;
      
            // Create test
            const [testRes] = await tx.insert(Tests).values(test).returning({
              id: Tests.id,
              endTime: Tests.endTime
            });
            if (!testRes) throw new BadRequestError("Test creation failed");
      
            const testId = testRes.id as string;
            const endTime = testRes.endTime as Date;
      
            // Link questions to test
            const questions = questionsRes.map((q) => ({
              testId,
              userId: test.userId,
              questionType: q.type,
              questionId: q.id as string,
              subjectId: q.subjectId as string,
              courseId: q.courseId as string,
              examId: q.examId as string,
            }));
      
            // Save new used question records
            const newUsedQuestions = questions.filter((q) => !userQuestions.includes(q.questionId));
            if (newUsedQuestions.length > 0) {
              await tx.insert(UserQuestionRecords).values(newUsedQuestions);
            }
      
            await tx.insert(TestQuestionRecords).values(questions);
            return { testId, endTime };
          });
        } catch (error) {
          throw error;
        }
      };
      

    getTestQuestions = async (testId: string, userId: string): Promise<Question[]> => {
        try {
            // Fetch test question records (preserve order)
            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                orderBy: asc(TestQuestionRecords.id),
                columns: { questionId: true }
            });
    
            if (testQuestionsRes.length <= 0) {
                throw new NotFoundError("No questions for this test");
            }
    
            const userQuestions = testQuestionsRes.map((q) => q.questionId);
    
            // Define type that supports relation
            type QuestionWithOptions = typeof Questions.$inferSelect & {
                options?: Array<{
                    id: string;
                    index: number;
                    value: string;
                    selected?: number | null; // ✅ numeric (0 or 1)
                    answer?: boolean | null;
                }>;
            };
    
            // Fetch full question details
            const questionsRes: QuestionWithOptions[] = await this.db.query.Questions.findMany({
                where: inArray(Questions.id, userQuestions),
                with: { options: true }
            });
    
            // Map for quick access
            const questionsMap = new Map(questionsRes.map(q => [q.id, q]));
    
            // Reorder based on saved order
            const orderedQuestions = userQuestions.map((id) => {
                const q = questionsMap.get(id);
                if (!q) throw new Error(`Question ${id} not found`);
                return q;
            });
    
            // Map to standard Question[]
            return orderedQuestions.map((question): Question => ({
                id: question.id as string,
                type: question.type as QuestionType,
                explanation: question.explanation ?? "",
                question: question.question ?? "",
                options: (question.options ?? []).map((opt): Option => ({
                    id: opt.id,
                    index: opt.index,
                    value: opt.value,
                    selected: opt.selected ?? 0, 
                    answer: opt.answer ?? false  // ✅ boolean
                }))
            }));
        } catch (error) {
            throw error;
        }
    };
    
    deleteTest = async (testId: string, userId: string): Promise<string> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId)),
            });
    
            if (!test) {
                throw new NotFoundError("Test not found or unauthorized");
            }
    
            if (test.status !== "complete" && test.status !== "paused") {
                throw new BadRequestError("You can only delete a completed or paused test");
            }
    
            await this.db.transaction(async (tx) => {
                await tx.delete(TestQuestionRecords).where(eq(TestQuestionRecords.testId, testId));
    
                await tx.delete(Tests).where(eq(Tests.id, testId));
            });
    
            return "Test deleted successfully";
        } catch (error) {
            console.error("deleteTest error:", error);
            throw error;
        }
    };
    

    // getTestQuestions = async (testId: string, userId: string): Promise<Question[]> => {
    //     try {
    //         // fetch all user questions record
    //         const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
    //             where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
    //             columns: {
    //                 questionId: true
    //             }
    //         })
    //         if (testQuestionsRes.length <= 0) {
    //             throw new NotFoundError("No questions for this test")
    //         }
    //         let filters = []
    //         const userQuestions: string[] = testQuestionsRes.map((question) => question.questionId)
    //         filters.push(inArray(Questions.id, userQuestions))

    //         const questionsRes: QuestionT[] = await this.db.query.Questions.findMany({
    //             where: and(...filters),
    //             with: {
    //                 options: true,
    //             },
    //             orderBy: sql`RANDOM
    //             ()`
    //         })
    //         return questionsRes.map((question): Question => {
    //             return {
    //                 id: question?.id as string,
    //                 type: question?.type as QuestionType,
    //                 explanation: question?.explanation as string,
    //                 question: question?.question as string,
    //                 options: question?.options?.map((option: any): Option => {
    //                     return {
    //                         id: option.id,
    //                         index: option.index,
    //                         value: option.value,
    //                         selected: option.selected,
    //                         answer: option.answer,
    //                     }
    //                 })
    //             }
    //         })
    //     } catch (error) {
    //         throw error
    //     }
    // }

    scoreTest = async (testId: string, userId: string, answers: UserAnswer[]): Promise<string> => {
        try {
            // fetch test
            const test = await this.db.query.Tests.findFirst({
                where: eq(Tests.id, testId)
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test completed ")
            }
            // fetch all user questions record
            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                columns: {
                    questionId: true,
                    questionStatus: true
                }
            })
            if (testQuestionsRes.length <= 0) {
                throw new NotFoundError("No questions for this test")
            }
            let filters = []
            const userQuestions: string[] = testQuestionsRes.map((question) => question.questionId)
            filters.push(inArray(Questions.id, userQuestions))

            const questionsRes: QuestionT[] = await this.db.query.Questions.findMany({
                where: and(...filters),
                with: {
                    options: true,
                },
            })

            let correctAnswers: number = test.correctAnswers as number
            let incorrectAnswers: number = test.incorrectAnswers as number
            let unansweredQuestions: number = test.unansweredQuestions as number

            let answeredQuestions: string[] = []

            for await (const answer of answers) {
                console.log(answer)
                let status: QuestionStatus = "unanswered"
                const question = questionsRes.find((question) => question?.id === answer.questionId)
                if (!question) {
                    continue
                }
                const questionExist = answeredQuestions.find((questionId) => questionId === answer.questionId)
                if (questionExist) {
                    continue
                }
                const options = question?.options?.map((option: any): Option => {
                    return {
                        id: option.id,
                        index: option.index,
                        value: option.value,
                        selected: option.selected,
                        answer: option.answer,
                    }
                })
                const previousQuestionStatus = testQuestionsRes.find((question) => answer.questionId == question.questionId)
                if (!previousQuestionStatus) {
                    continue
                }
                if (question?.type == "single_choice" && answer.option) {
                    const selectedOption = options?.find((option) => option.id == answer.option)
                    if (selectedOption) {
                        const correctOption = options?.find((option) => option.answer)

                        if (correctOption && (correctOption.id == selectedOption.id)) {
                            status = "correct"
                            if (previousQuestionStatus.questionStatus == "unanswered") correctAnswers += 1
                            if (previousQuestionStatus.questionStatus == "wrong") {
                                correctAnswers += 1
                                incorrectAnswers -= 1
                            }
                            // if (previousQuestionStatus.questionStatus == "correct") {}

                        } else {
                            status = "wrong"

                            if (previousQuestionStatus.questionStatus == "unanswered") incorrectAnswers += 1
                            if (previousQuestionStatus.questionStatus == "correct") {
                                correctAnswers -= 1
                                incorrectAnswers += 1
                            }
                            // if (previousQuestionStatus.questionStatus == "wrong") {}
                        }
                        await this.db.update(Options).set({selected: selectedOption.selected as number + 1}).where(eq(Options.id, selectedOption.id as string))
                        await this.db.update(TestQuestionRecords).set({
                            questionStatus: status,
                            optionId: selectedOption.id
                        }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                    }
                } else if (question?.type == "multiple_choice" && answer.options && answer.options.length > 0) {
                    const selectedOptions = options?.filter((option) => answer.options?.includes(option.id as string))
                    if (selectedOptions && selectedOptions.length > 0) {
                        const correctOptions = options?.filter((option) => option.answer)
                        if (correctOptions && (selectedOptions.length === correctOptions.length) && (selectedOptions.every((element, index) => element === correctOptions[index]))) {
                            status = "correct"
                            if (previousQuestionStatus.questionStatus == "unanswered") correctAnswers += 1
                            if (previousQuestionStatus.questionStatus == "wrong") {
                                correctAnswers += 1
                                incorrectAnswers -= 1
                            }
                            // if (previousQuestionStatus.questionStatus == "correct") {}
                        } else {
                            status = "wrong"

                            if (previousQuestionStatus.questionStatus == "unanswered") incorrectAnswers += 1
                            if (previousQuestionStatus.questionStatus == "correct") {
                                correctAnswers -= 1
                                incorrectAnswers += 1
                            }
                            // if (previousQuestionStatus.questionStatus == "wrong") {}
                        }
                        for await (let option of selectedOptions) {
                            await this.db.update(Options).set({selected: option.selected as number + 1}).where(eq(Options.id, option.id as string))
                        }
                        const ids = selectedOptions.map((option) => option.id as string)
                        await this.db.update(TestQuestionRecords).set({
                            questionStatus: status,
                            options: ids
                        }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                    }
                } else if (question?.type == "fill_in_the_blanks" && answer.answer) {
                    const correctOptions = options?.filter((option) => option.value == answer.answer)
                    if (correctOptions && correctOptions.length > 0) {
                        status = "correct"
                        if (previousQuestionStatus.questionStatus == "unanswered") correctAnswers += 1
                        if (previousQuestionStatus.questionStatus == "wrong") {
                            correctAnswers += 1
                            incorrectAnswers -= 1
                        }
                        // if (previousQuestionStatus.questionStatus == "correct") {}
                    } else {
                        status = "wrong"

                        if (previousQuestionStatus.questionStatus == "unanswered") incorrectAnswers += 1
                        if (previousQuestionStatus.questionStatus == "correct") {
                            correctAnswers -= 1
                            incorrectAnswers += 1
                        }
                        // if (previousQuestionStatus.questionStatus == "wrong") {}
                    }
                    await this.db.update(TestQuestionRecords).set({
                        questionStatus: status,
                        answer: answer.answer
                    }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                }
                if (status == "unanswered") unansweredQuestions += 1
                answeredQuestions.push(answer.questionId)
            }

            const score = (correctAnswers / questionsRes.length) * 100

            const testUpdate = {
                correctAnswers,
                // status: "complete",
                incorrectAnswers,
                unansweredQuestions: questionsRes.length - (correctAnswers + incorrectAnswers),
                score
            }
            await this.db.update(Tests).set(testUpdate).where(eq(Tests.id, testId))

            return testId
        } catch (error) {
            throw error
        }

    }

    pauseTestStatus = async (testId: string, userId: string): Promise<void> => {
        const test = await this.db.query.Tests.findFirst({
            where: and(
                eq(Tests.id, testId),
                eq(Tests.userId, userId)
            ),
        });
    
        if (!test) {
            throw new BadRequestError("Test does not exist");
        }
    
        if (test.status !== "inProgress") {
            throw new BadRequestError("Test is not in progress");
        }
    
        if (!test.endTime) {
            throw new BadRequestError("Test timer is corrupted");
        }
    
        const now = new Date();
        const endTime = new Date(test.endTime);
    
        const secondsLeft = Math.max(
            0,
            Math.floor((endTime.getTime() - now.getTime()) / 1000)
        );
    
        if (secondsLeft <= 0) {
            await this.db
                .update(Tests)
                .set({
                    status: "complete",
                    timeLeft: 0,
                    endTime: null,
                })
                .where(and(
                    eq(Tests.id, testId),
                    eq(Tests.status, "inProgress") 
                ));
    
            throw new BadRequestError("Test time has expired");
        }
    
        await this.db
            .update(Tests)
            .set({
                status: "paused",
                timeLeft: secondsLeft, 
                endTime: null,        
            })
            .where(and(
                eq(Tests.id, testId),
                eq(Tests.status, "inProgress")
            ));
    };

    resumeTestStatus = async (
        testId: string,
        userId: string
    ): Promise<{ testId: string; timeLeft: number }> => {
        const test = await this.db.query.Tests.findFirst({
            where: and(
                eq(Tests.id, testId),
                eq(Tests.userId, userId)
            ),
        });
    
        if (!test) {
            throw new BadRequestError("Test does not exist");
        }
    
        if (test.status !== "paused") {
            throw new BadRequestError("Test is not paused");
        }
    
        const frozenTimeLeft = test.timeLeft as number | null;
    
        if (!frozenTimeLeft || frozenTimeLeft <= 0) {
            await this.db
                .update(Tests)
                .set({
                    status: "complete",
                    timeLeft: 0,
                    endTime: null,
                })
                .where(eq(Tests.id, testId));
    
            throw new BadRequestError("No time left to resume");
        }
    
        const newEndTime = new Date(Date.now() + frozenTimeLeft * 1000);
    
        await this.db
            .update(Tests)
            .set({
                status: "inProgress",
                endTime: newEndTime, 
                timeLeft: undefined,  
            })
            .where(and(
                eq(Tests.id, testId),
                eq(Tests.status, "paused") 
            ));
    
        return {
            testId,
            timeLeft: frozenTimeLeft,
        };
    };
    

    endTest = async (testId: string, userId: string): Promise<void> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId))
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test not in progress ")
            }

            await this.db.update(Tests).set({
                status: 'complete',
                timeLeft: 0,
            }).where(eq(Tests.id, testId))

            if (test.type == "mock") {
                await this.db.update(Exams).set({totalMockScores: sql`${Exams.totalMockScores} + ${test.score}`,mocksTaken: sql`${Exams.mocksTaken} + 1`}).where(eq(Exams.id,test.examId))
            }


        } catch (error) {
            throw error
        }
    }

    forceEndTest = async (testId: string): Promise<void> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId))
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test not in progress ")
            }

            await this.db.update(Tests).set({
                status: 'complete',
                timeLeft: 0,
            }).where(eq(Tests.id, testId))

            if (test.type == "mock") {
                await this.db.update(Exams).set({totalMockScores: sql`${Exams.totalMockScores} + ${test.score}`,mocksTaken: sql`${Exams.mocksTaken} + 1`}).where(eq(Exams.id,test.examId))
            }

        } catch (error) {
            throw error
        }
    }

    async GetTestQuestions(filter: PaginationFilter): Promise<{
        questions: QuestionWithReason[],
        metadata: PaginationMetaData
    }> {
        try {
            const filters: string | any[] = [];
            filters.push(and(eq(TestQuestionRecords.userId, filter.userId as string),eq(TestQuestionRecords.examId, filter.examId as string)));
            if (filter.questionStatus || filter.questionStatus != undefined) {
                filters.push(eq(TestQuestionRecords.questionStatus, filter.questionStatus as string));
            }
            const totalResult = await this.db.select({count: count()}).from(TestQuestionRecords).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    questions: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const testQuestions = await this.db.query.TestQuestionRecords.findMany({
                where: and(...filters),
                with: {
                    question: {
                        with: {
                            subject: true,
                            course: true
                        }
                    }
                },
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
            })

            if (testQuestions.length > 0) {
                return {
                    questions: testQuestions.map((question: any): QuestionWithReason => {
                        return {
                            id: question.question.id as string,
                            type: question.question.type as QuestionType,
                            reason: question.reason,
                            courseName: question.question.course.name,
                            subjectName: question.question.subject.name,
                            createdAt:question.createdAt as Date
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }


            return {
                questions: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch (error) {
            throw error
        }
    }

}