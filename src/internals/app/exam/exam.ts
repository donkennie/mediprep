import { AddExamCommand, AddExamCommandC } from "./commands/addExam";
import { ExamRepository } from "../../domain/exams/repository";
import { EditExamCommand, EditExamCommandC } from "./commands/editExam";
import { UploadExamImageCommand, UploadExamImageCommandC } from "./commands/uploadExamImage";
import { StorageRepository } from "../../domain/storage/repository";
import { DeleteExamCommand, DeleteExamCommandC } from "./commands/deleteExam";
import { GetExamsQuery, GetExamsQueryC } from "./query/getExams";
import { AddCourseCommand, AddCourseCommandC } from "./commands/addCourse";
import { DeleteCourseCommand, DeleteCourseCommandC } from "./commands/deleteCourse";
import { EditCourseCommand, EditCourseCommandC } from "./commands/editCourse";
import { GetCoursesQuery, GetCoursesQueryC } from "./query/getCourses";
import { AddSubjectCommand, AddSubjectCommandC } from "./commands/addSubject";
import { EditSubjectCommand, EditSubjectCommandC } from "./commands/editSubject";
import { DeleteSubjectCommand, DeleteSubjectCommandC } from "./commands/deleteSubject";
import { GetSubjectsQuery, GetSubjectsQueryC } from "./query/getSubjects";
import { AddQuestionCommand, AddQuestionCommandC } from "./commands/addQuestion";
import { EditQuestionCommand, EditQuestionCommandC } from "./commands/editQuestion";
import { DeleteQuestionCommand, DeleteQuestionCommandC } from "./commands/deleteQuestion";
import { GetQuestionsQuery, GetQuestionsQueryC } from "./query/getQuestions";
import { QueueRepository } from "../../domain/queue/repository";
import { AddQuestionFileCommand, AddQuestionFileCommandC } from "./commands/addQuestionFile";
import { GetExamsAnalytics, GetExamsAnalyticsC } from "./query/getExamAnalytics";
import { TestRepository } from "../../domain/tests/repository";
import { TagQuestionCommand, TagQuestionCommandC } from "./commands/tagQuestion";
import { ReportQuestionCommand, ReportQuestionCommandC } from "./commands/reportQuestion";
import { GetExamsDetails, GetExamsDetailsC } from "./query/getExamDetails";
import { AddExamDiscountCommand, AddExamDiscountCommandC } from "./commands/addExamDiscount";
import { GetTaggedQuestionsQuery, GetTaggedQuestionsQueryC } from "./query/getTaggedQuestion";
import { GetReportedQuestionsQuery, GetReportedQuestionsQueryC } from "./query/getReportedQuestions";
import { GetQuestionByIdQuery, GetQuestionByIdQueryC } from "./query/getQuestionById";
import { UploadImageCommand, UploadImageCommandC } from "./commands/uploadImage";
import { GetQuestionBatch, GetQuestionBatchC } from "./query/getBatchSatus";
import { DeleteDiscountCommandC } from "./commands/deleteDiscount";
import { UnTagQuestionCommand, UnTagQuestionCommandC } from "./commands/unTagQuestion";

export class Commands {
    addExam: AddExamCommand;
    deleteExam: DeleteExamCommand
    editExam: EditExamCommand
    uploadExamImage: UploadExamImageCommand
    uploadImage: UploadImageCommand

    addCourse: AddCourseCommand
    deleteCourse: DeleteCourseCommand
    editCourse: EditCourseCommand

    addSubject: AddSubjectCommand
    deleteSubject: DeleteSubjectCommand
    editSubject: EditSubjectCommand

    addQuestion: AddQuestionCommand
    addQuestionFile: AddQuestionFileCommand
    deleteQuestion: DeleteQuestionCommand
    editQuestion: EditQuestionCommand

    tagQuestion: TagQuestionCommand
    unTagQuestion: UnTagQuestionCommand

    reportQuestion: ReportQuestionCommand

    addExamDiscount: AddExamDiscountCommand
    deleteDiscount: DeleteDiscountCommandC

    constructor(examRepository: ExamRepository, storageRepository: StorageRepository, queueRepository: QueueRepository) {
        this.addExam = new AddExamCommandC(examRepository)
        this.deleteExam = new DeleteExamCommandC(examRepository)
        this.editExam = new EditExamCommandC(examRepository)
        this.uploadExamImage = new UploadExamImageCommandC(examRepository, storageRepository)
        this.uploadImage = new UploadImageCommandC(storageRepository)

        this.addCourse = new AddCourseCommandC(examRepository)
        this.deleteCourse = new DeleteCourseCommandC(examRepository)
        this.editCourse = new EditCourseCommandC(examRepository)

        this.addSubject = new AddSubjectCommandC(examRepository)
        this.deleteSubject = new DeleteSubjectCommandC(examRepository)
        this.editSubject = new EditSubjectCommandC(examRepository)

        this.addQuestion = new AddQuestionCommandC(examRepository)
        this.addQuestionFile = new AddQuestionFileCommandC(examRepository, storageRepository, queueRepository)
        this.deleteQuestion = new DeleteQuestionCommandC(examRepository)
        this.editQuestion = new EditQuestionCommandC(examRepository)

        this.tagQuestion = new TagQuestionCommandC(examRepository)
        this.unTagQuestion = new UnTagQuestionCommandC(examRepository)
        this.reportQuestion = new ReportQuestionCommandC(examRepository)

        this.addExamDiscount = new AddExamDiscountCommandC(examRepository)
        this.deleteDiscount = new DeleteDiscountCommandC(examRepository)
    }
}

export class Queries {
    getExams: GetExamsQuery
    getCourses: GetCoursesQuery
    getSubjects: GetSubjectsQuery
    getQuestions: GetQuestionsQuery
    getQuestionById: GetQuestionByIdQuery
    getExamAnalytics: GetExamsAnalytics
    getExamDetails: GetExamsDetails
    getTaggedQuestionsQuery: GetTaggedQuestionsQuery
    getReportedQuestionsQuery: GetReportedQuestionsQuery
    getQuestionBatches: GetQuestionBatch

    constructor(examRepository: ExamRepository, testRepository: TestRepository) {
        this.getExams = new GetExamsQueryC(examRepository)
        this.getCourses = new GetCoursesQueryC(examRepository)
        this.getSubjects = new GetSubjectsQueryC(examRepository)
        this.getQuestions = new GetQuestionsQueryC(examRepository)
        this.getQuestionById = new GetQuestionByIdQueryC(examRepository)
        this.getExamAnalytics = new GetExamsAnalyticsC(examRepository, testRepository)
        this.getExamDetails = new GetExamsDetailsC(examRepository)
        this.getTaggedQuestionsQuery = new GetTaggedQuestionsQueryC(examRepository)
        this.getReportedQuestionsQuery = new GetReportedQuestionsQueryC(examRepository)
        this.getQuestionBatches = new GetQuestionBatchC(examRepository)
    }
}

export class ExamServices {
    examRepository: ExamRepository
    storageRepository: StorageRepository
    commands: Commands
    queries: Queries

    constructor(examRepository: ExamRepository, storageRepository: StorageRepository, queueRepository: QueueRepository, testRepository: TestRepository
    ) {
        this.examRepository = examRepository;
        this.storageRepository = storageRepository;
        this.commands = new Commands(examRepository, storageRepository, queueRepository)
        this.queries = new Queries(examRepository, testRepository)
    }
}