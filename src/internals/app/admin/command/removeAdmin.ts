import { BadRequestError } from "../../../../pkg/errors/customError";
import { AdminRepository } from "../../../domain/admins/repository";

export interface RemoveAdminCommand {
    Handle: (adminId: string) => Promise<void>;
}

export class RemoveAdminCommandC implements RemoveAdminCommand {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }

    Handle = async (adminId: string): Promise<void> => {
        try {
            const admin  = await this.adminRepository.GetAdminByID(adminId)
            if (admin?.examAccess?.includes("SUPER_ADMIN")) {
                throw  new BadRequestError("Super Admin can not be deleted")
            }
            await this.adminRepository.RemoveAdmin(adminId)
        } catch (error) {
            throw error;
        }
    };
}