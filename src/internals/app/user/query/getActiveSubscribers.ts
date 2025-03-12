import {PaginationMetaData} from "../../../../pkg/types/pagination";
import {UserRepository} from "../../../domain/users/repository";
import {User, UserExamAccess} from "../../../domain/users/user";

export interface GetAllActiveSubscribersQuery {
    handle: () => Promise<{ userId: string; expiryDate: Date }[]>
}

export class GetAllActiveSubscribersQueryC implements GetAllActiveSubscribersQuery {
    userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    handle = async (): Promise<{ userId: string; expiryDate: Date }[]> => {
        try {
            const user = await this.userRepository.getAllActiveSubscribers();
            return user;
        } catch (error) {
            throw error
        }
    };
}
