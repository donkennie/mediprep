import {EditUser, User, UserExamAccess} from "./user";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface UserRepository {
    addUser: (user: User) => Promise<User>,
    updateUser: (user: Partial<User>) => Promise<User>,
    getUsers: (filter: PaginationFilter) => Promise<{ users: User[], metadata: PaginationMetaData }>
    editUser: (id: string, userParams: EditUser) => Promise<void>,
    getUserDetails: (id: string) => Promise<User>
    getUserDetailsWithAnalytics: (id: string) => Promise<User>
    getAllActiveSubscribers: () => Promise<{ userId: string; expiryDate: Date }[]>
    getUserByEmail: (email: string) => Promise<User>
    deleteUserDetails: (id: string) => Promise<void>
    applyReferralCode: (newUserId: string, referralCode: string) => Promise<boolean>
    addUserExamAccess: (examToUser: UserExamAccess) => Promise<void>
    updateExamAccess: (examToUser: UserExamAccess) => Promise<void>
    getUserExamAccess: (examId: string, userId: string) => Promise<UserExamAccess>
    getUserReferrals: (userId: string) => Promise<any[]> 
}