CREATE TABLE "admin" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(32),
	"email" varchar(256),
	"password" varchar(256),
	"roles" varchar(32)[] DEFAULT ARRAY
        ['viewer']::varchar(32)[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid DEFAULT gen_random_uuid(),
	"months" integer DEFAULT 0,
	"price" numeric DEFAULT '0.0',
	"exam_id" uuid NOT NULL,
	"cart_id" uuid,
	CONSTRAINT "cart_items_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid DEFAULT gen_random_uuid(),
	"total_price" numeric DEFAULT '0.0',
	"user_id" uuid,
	CONSTRAINT "carts_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(128) NOT NULL,
	"exam_id" uuid,
	CONSTRAINT "courses_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "exam_access" (
	"admin_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	CONSTRAINT "exam_access_admin_id_exam_id_pk" PRIMARY KEY("admin_id","exam_id")
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid DEFAULT gen_random_uuid(),
	"month" integer NOT NULL,
	"type" varchar(32) DEFAULT 'percent',
	"value" numeric DEFAULT '0.0',
	"exam_id" uuid,
	CONSTRAINT "discounts_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(32),
	"total_mock_score" double precision DEFAULT 0 NOT NULL,
	"mock_taken" integer DEFAULT 0 NOT NULL,
	"mock_test_time" integer DEFAULT 60 NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(255),
	"subscription_amount" numeric DEFAULT '0.0',
	"mock_questions" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "exam_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "exam_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "option" (
	"id" uuid DEFAULT gen_random_uuid(),
	"index" integer NOT NULL,
	"value" text NOT NULL,
	"selected" integer DEFAULT 0,
	"answer" boolean DEFAULT false,
	"question_id" uuid,
	CONSTRAINT "option_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "question_batch" (
	"id" uuid DEFAULT gen_random_uuid(),
	"status" varchar(128) DEFAULT 'processing',
	"exam_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "question_batch_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" uuid DEFAULT gen_random_uuid(),
	"question_number" serial NOT NULL,
	"exam_question_number" integer NOT NULL,
	"type" varchar(32) NOT NULL,
	"question" text NOT NULL,
	"explanation" text,
	"free" boolean DEFAULT false,
	"subject_id" uuid,
	"course_id" uuid,
	"exam_id" uuid,
	"question_batch_id" uuid,
	CONSTRAINT "question_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" uuid DEFAULT gen_random_uuid(),
	"name" varchar(128) NOT NULL,
	"course_id" uuid,
	"exam_id" uuid,
	CONSTRAINT "subject_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "user_question_records" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"subject_id" uuid,
	"course_id" uuid,
	"exam_id" uuid,
	CONSTRAINT "user_question_records_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "user_report_question_records" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"exam_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"reason" text NOT NULL,
	CONSTRAINT "user_report_question_records_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "user_tag_question_records" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"exam_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_tag_question_records_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"months" integer DEFAULT 0 NOT NULL,
	"price" double precision DEFAULT 0,
	"exam_id" uuid NOT NULL,
	"sale_id" uuid NOT NULL,
	CONSTRAINT "sale_items_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(128),
	"access_code" varchar(128),
	"payment_gateway" varchar(128) DEFAULT 'stripe' NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"status" varchar(64) DEFAULT 'pending' NOT NULL,
	"email" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	CONSTRAINT "sale_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "test_question_records" (
	"id" uuid DEFAULT gen_random_uuid(),
	"question_status" varchar(32) DEFAULT 'unanswered' NOT NULL,
	"type" varchar(32) NOT NULL,
	"test_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"option_id" uuid,
	"options" text[] DEFAULT '{}'::text[],
	"answer" text,
	"question_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"subject_id" uuid,
	"course_id" uuid,
	"exam_id" uuid NOT NULL,
	CONSTRAINT "test_question_records_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid DEFAULT gen_random_uuid(),
	"status" varchar(32) DEFAULT 'inProgress' NOT NULL,
	"score" double precision DEFAULT 0 NOT NULL,
	"questions" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"incorrect_answers" integer DEFAULT 0,
	"unanswered_questions" integer DEFAULT 0,
	"type" varchar(32) DEFAULT 'mock',
	"question_mode" varchar(32) DEFAULT 'unused',
	"user_id" uuid NOT NULL,
	"subject_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"course_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"exam_id" uuid NOT NULL,
	"end_Time" timestamp DEFAULT '2025-03-12 22:14:00.701',
	"time_left" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tests_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "referral" (
	"id" uuid DEFAULT gen_random_uuid(),
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"referral_code" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "referral_referred_id_unique" UNIQUE("referred_id"),
	CONSTRAINT "referral_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "user_exam_access" (
	"user_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "user_exam_access_user_id_exam_id_pk" PRIMARY KEY("user_id","exam_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid DEFAULT gen_random_uuid(),
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(64) NOT NULL,
	"password" varchar(256),
	"profession" varchar(64),
	"country" varchar(64),
	"verified" boolean DEFAULT false,
	"black_listed" boolean DEFAULT false NOT NULL,
	"referral_code" varchar(10),
	"referred_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_access" ADD CONSTRAINT "exam_access_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_access" ADD CONSTRAINT "exam_access_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_batch" ADD CONSTRAINT "question_batch_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_question_batch_id_question_batch_id_fk" FOREIGN KEY ("question_batch_id") REFERENCES "public"."question_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_question_records" ADD CONSTRAINT "user_question_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_records" ADD CONSTRAINT "user_question_records_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_question_records" ADD CONSTRAINT "user_question_records_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_question_records" ADD CONSTRAINT "user_question_records_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_question_records" ADD CONSTRAINT "user_question_records_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_report_question_records" ADD CONSTRAINT "user_report_question_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_report_question_records" ADD CONSTRAINT "user_report_question_records_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_report_question_records" ADD CONSTRAINT "user_report_question_records_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_tag_question_records" ADD CONSTRAINT "user_tag_question_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tag_question_records" ADD CONSTRAINT "user_tag_question_records_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_tag_question_records" ADD CONSTRAINT "user_tag_question_records_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sale"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "test_question_records" ADD CONSTRAINT "test_question_records_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_exam_access" ADD CONSTRAINT "user_exam_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_exam_access" ADD CONSTRAINT "user_exam_access_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;