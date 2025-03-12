import {UserRepository} from "../../../domain/users/repository";

export interface getUserReferralsQuery {
    handle: (id: string) => Promise<any[]>
}

export class getUserReferralsQueryC implements getUserReferralsQuery {
    userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    handle = async (id: string): Promise<any[]> => {
        try {
            const user = await this.userRepository.getUserReferrals(id);
            return user;
        } catch (error) {
            throw error
        }
    };
}
