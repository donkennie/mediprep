import { ExamRepository } from "../../../domain/exams/repository";

export interface UnTagQuestionCommand {
    Handle: (userId: string, questionId: string) => Promise<void>
}

export class UnTagQuestionCommandC implements UnTagQuestionCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(userId: string, questionId: string): Promise<void> {
        try {
            await this.examRepository.UnTagQuestion(userId, questionId)
        } catch (error) {
            throw error
        }
    }
}
