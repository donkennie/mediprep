import {BadRequestError} from "../../../../pkg/errors/customError";
import {encrypt} from "../../../../pkg/utils/encryption";
import {generateRandomPassword} from "../../../../pkg/utils/generateValue";
import {Admin} from "../../../domain/admins/admin";
import {AdminRepository} from "../../../domain/admins/repository";
import {Email} from "../../../domain/notification/email";
import {newEmailQueueRecord, Record} from "../../../domain/queue/producer";
import {QueueRepository} from "../../../domain/queue/repository";
import {Environment} from "../../../../pkg/configs/env";
import {assignmentHtml} from "../../../../pkg/utils/html";

export interface AssignQuestionsCommand {
    Handle: (adminId: string, range: string, examId?: string) => Promise<string | void>;
}

export class AssignQuestionsCommandC implements AssignQuestionsCommandC {
    adminRepository: AdminRepository;
    emailQueueRepository: QueueRepository;
    environmentVariables: Environment

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: QueueRepository,
        environmentVariables: Environment
    ) {
        this.adminRepository = adminRepository;
        this.emailQueueRepository = emailQueueRepository;
        this.environmentVariables = environmentVariables
    }

    Handle = async (adminId: string, range: string, examId?: string): Promise<string | void> => {
        try {
            const admin  = await this.adminRepository.GetAdminByID(adminId)
            if (!admin) {
                throw  new BadRequestError("admin with id does not exist")
            }
            // Send credentials to mail by publishing message to queue
            const email: Email = {
                subject: "Questions Assignment",
                mailTo: [admin.email],
                html: assignmentHtml(range,this.environmentVariables.questionViewURL,examId),
            };
            const emailQueueRecord: Record = newEmailQueueRecord(email);
            await this.emailQueueRepository.Produce(emailQueueRecord);
        } catch (error) {
            throw error;
        }
    };
}
