import { z } from "zod";
import { uuidSchema } from "./admin";

export const addExamSchema = z.object({
    name: z.string(),
    description: z.string(),
    totalMockScores: z.number().optional(),
    mockTestTime: z.number(),
    subscriptionAmount: z.number(),
    mockQuestions: z.number()
});

export const addExamDiscountSchema = z.object({
    month: z.number(),
    type: z.enum(["percent", "flat"]).optional().default('percent'),
    value: z.number(),
    examId: uuidSchema,
});

export const editExamSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    totalMockScores: z.number().optional(),
    mockTestTime: z.number().optional(),
    subscriptionAmount: z.number().optional(),
    mockQuestions: z.number().optional()
});

export const examIdSchema = z.object({
    id: uuidSchema
})
export const discountIdSchema = z.object({
    discountID: uuidSchema
})

export const userExamIdSchema = z.object({
    examId: uuidSchema
})

const rangeSchema = z.string().optional().refine((value) => {
    if (value === undefined || value === '') return true;
    const rangeRegex = /^(\d+-\d+|\d+)(,(\d+-\d+|\d+))*$/;
    return rangeRegex.test(value);
}, {
    message: "Invalid range format. Use format like '1-100,213,2550-300'"
});
const rangeSchemaRequired = z.string().refine((value) => {
    if (value === undefined || value === '') return true;
    const rangeRegex = /^(\d+-\d+|\d+)(,(\d+-\d+|\d+))*$/;
    return rangeRegex.test(value);
}, {
    message: "Invalid range format. Use format like '1-100,213,2550-300'"
});

export const getCommandFilterSchema = z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    name: z.string().optional(),
    examId: uuidSchema.optional(),
    courseId: uuidSchema.optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    profession: z.string().optional(),
    country: z.string().optional(),
    subjectId: uuidSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    testType: z.enum(["subjectBased", "courseBased", "mock"]).optional(),
    status: z.enum(["inProgress", "complete", "paused"]).optional(),
    range: rangeSchema
});


export const courseSchema = z.object({
    name: z.string(),
    examId: uuidSchema
});

export const editCourseSchema = z.object({
    name: z.string()
});

export const courseIdSchema = z.object({
    courseId: uuidSchema
})

export const subjectSchema = z.object({
    name: z.string(),
    courseId: uuidSchema
});

export const editSubjectSchema = z.object({
    name: z.string()
});

export const subjectIdSchema = z.object({
    subjectId: uuidSchema
})


const optionSchema = z.object({
    value: z.string(),
    answer: z.boolean(),
    explanation: z.string().optional()
})

export const questionSchema = z.object({
    type: z.enum(["single_choice", "multiple_choice", "fill_in_the_blanks"]),
    question: z.string(),
    explanation: z.string(),
    subjectId: uuidSchema,
    options: z.array(optionSchema).min(1)
})

const editOptionSchema = z.object({
    index: z.number(),
    value: z.string().optional(),
    answer: z.boolean().optional(),
    explanation: z.string().optional()
})

export const editQuestionSchema = z.object({
    type: z.enum(["single_choice", "multiple_choice", "fill_in_the_blanks"]).optional(),
    question: z.string().optional(),
    explanation: z.string().optional(),
    options: z.array(editOptionSchema).optional()
})

export const questionIdSchema = z.object({
    questionId: uuidSchema
})

export const paginationSchema = z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    questionStatus: z.enum(["correct", "unanswered", "wrong"]).optional()
});

export const assignQuestionSchema= z.object({
    adminId: uuidSchema,
    range: rangeSchemaRequired,
    examId: uuidSchema.optional()
})