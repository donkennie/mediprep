import {TestRepository} from "../../../domain/tests/repository";

export interface DeleteCompletedTest {
    Handle: (testId: string, userId: string) => Promise<void>
}

export class DeleteCompletedTestC implements DeleteCompletedTest {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string, userId: string): Promise<void> => {
        try {
            await this.testRepositories.deleteTest(testId, userId)
        } catch (error) {
            throw error;
        }
    }

}