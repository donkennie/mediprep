CREATE TABLE "question_assignments" (
	"id" uuid DEFAULT gen_random_uuid(),
	"admin_id" uuid NOT NULL,
	"exam_id" uuid,
	"question_range" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "question_assignments_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "end_Time" SET DEFAULT '2025-09-23 06:44:17.528';--> statement-breakpoint
ALTER TABLE "question_assignments" ADD CONSTRAINT "question_assignments_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "question_assignments" ADD CONSTRAINT "question_assignments_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;