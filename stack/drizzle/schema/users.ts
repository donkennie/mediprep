import {boolean, pgTable, primaryKey, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {Exams, UserQuestionRecords} from "./exams";
import {relations, AnyColumn } from "drizzle-orm";
import {Sales} from "./sales";
import {Tests} from "./test";

export const Users = pgTable("user", {
    id: uuid('id').defaultRandom(),
    firstName: varchar('first_name', {length: 64}).notNull(),
    lastName: varchar('last_name', {length: 64}).notNull(),
    email: varchar('email', {length: 64}).notNull().unique(),
    password: varchar('password', {length: 256}),
    profession: varchar('profession', {length: 64}),
    country: varchar('country', {length: 64}),
    verified: boolean('verified').default(false),
    blacklisted: boolean('black_listed').default(false).notNull(),
    referralCode: varchar('referral_code', {length: 10}).unique(),
    referredBy: uuid('referred_by'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({columns: [t.id]})
}))

export const UserExamAccess = pgTable('user_exam_access', {
    userId: uuid('user_id').notNull().references(() => Users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    examId: uuid('exam_id').notNull().references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    expiryDate: timestamp("expires").notNull()
}, (t) => ({
    pk: primaryKey({columns: [t.userId, t.examId]}),
}))

export const userToExamRelations = relations(UserExamAccess, ({one}) => ({
    exam: one(Exams, {
        fields: [UserExamAccess.examId],
        references: [Exams.id],
    }),
    user: one(Users, {
        fields: [UserExamAccess.userId],
        references: [Users.id],
    }),
}));

export const UsersRelations = relations(Users, ({ one, many }) => ({
    referrer: one(Users, {
        fields: [Users.referredBy],
        references: [Users.id],
    }),
    referrals: many(Users),
}));



export const userExamRelations = relations(Users, ({many}) => ({
    userExamAccess: many(UserExamAccess),
    sales: many(Sales),
    questionRecords: many(UserQuestionRecords),
    tests: many(Tests)
}));

export const Referrals = pgTable("referral", {
    id: uuid('id').defaultRandom(),
    referrerId: uuid('referrer_id').notNull(),
    referredId: uuid('referred_id').notNull().unique(),
    referralCode: varchar("referral_code", { length: 10 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({columns: [t.id]})
}));

export const ReferralsRelations = relations(Referrals, ({ one }) => ({
    referrer: one(Users, {
        fields: [Referrals.referrerId],
        references: [Users.id],
    }),
    referred: one(Users, {
        fields: [Referrals.referredId],
        references: [Users.id],
    })
}));