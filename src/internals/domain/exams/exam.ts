export type Exam = {
    id?: string;
    name: string;
    description: string;
    subscriptionAmount: number;
    totalMockScores: number;
    mocksTaken: number;
    mockTestTime: number;
    imageURL?: string;
    mockQuestions?: number;
    courses?: Course[],
    createdAt?: Date;
    updatedAt?: Date;
    testAveragePercent?: number,
    mockAveragePercent?: number,
    subjectsNo?: number,
    coursesNo?: number,
    usersNo?: number,
    salesNo?: number
};

export type ExamDiscount = {
    id?: string;
    month: number;
    type: 'percent' | 'flat'
    value :number;
    examID: string;
}

export type EditExamParams = {
    name?: string;
    description?: string;
    imageURL?: string;
    subscriptionAmount?: number | string;
    mockQuestions?: number;
};

export type Course = {
    id?: string;
    name: string;
    examId?: string;
    subjects?: Subject[]
}

export type Subject = {
    id?: string;
    name: string;
    courseId?: string;
    questions?: Question[]
}

export type QuestionType = "single_choice" | "multiple_choice" | "fill_in_the_blanks"
export type QuestionStatus = "correct" | "unanswered" | "wrong";
export type Question = {
    id?: string;
    questionNumber?: number;
    examQuestionNumber?: number;
    type: QuestionType;
    question: string;
    explanation: string;
    subjectId?: string;
    subjectName?: string;
    courseName?: string;
    questionBatchId?: string;
    options?: Option[];
    questionStatus?: QuestionStatus;
    selectedAnswer?: string | string[]
}

export type QuestionWithReason = {
    id?: string;
    type: QuestionType;
    reason: string;
    subjectName?: string;
    courseName?: string;
    createdAt: Date
    questionStatus?: QuestionStatus;
}

export type EditQuestionParams = {
    id?: string;
    type?: QuestionType;
    question?: string;
    questionImageUrl?: string;
    explanation?: string;
    explanationImageUrl?: string;
    options?: EditOptionParams[]
}

export type Option = {
    id?: string;
    index?: number;
    value: string;
    selected?: number;
    answer?: boolean;
}

export type EditOptionParams = {
    index: number,
    value?: string,
    answer?: boolean,
    explanation?: string
}

export type ExamQuestionFile = { blobName: string, examId: string, batchId: string }

export type QuestionBatchStatus = "processing" | "failed" | "complete";

export type QuestionBatch = {
    id: string,
    status: QuestionBatchStatus,
    examId: string,
    createdAt: Date,
    updatedAt: Date,
}