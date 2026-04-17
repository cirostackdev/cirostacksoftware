CREATE TABLE IF NOT EXISTS "ai_tutor_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model_used" varchar(20) DEFAULT 'claude' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"condition_type" varchar(30) NOT NULL,
	"condition_value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capstone_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"live_url" varchar(500) NOT NULL,
	"github_url" varchar(500),
	"screenshot_url" varchar(500),
	"tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"instructor_score" integer,
	"instructor_feedback" text,
	"is_talent_pipeline_flagged" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verification_code" varchar(32) NOT NULL,
	"pdf_url" varchar(500),
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"what_you_learn" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"thumbnail_url" varchar(500),
	"trailer_mux_id" varchar(255),
	"instructor_id" uuid NOT NULL,
	"learning_path_id" uuid,
	"level" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"price_ngn" integer DEFAULT 0 NOT NULL,
	"price_usd" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"has_ai_vs_manual" boolean DEFAULT false NOT NULL,
	"has_prompt_lab" boolean DEFAULT false NOT NULL,
	"has_client_brief" boolean DEFAULT false NOT NULL,
	"has_capstone" boolean DEFAULT false NOT NULL,
	"whatsapp_group_url" varchar(500),
	"total_lessons" integer DEFAULT 0 NOT NULL,
	"total_duration_secs" integer DEFAULT 0 NOT NULL,
	"enrolment_count" integer DEFAULT 0 NOT NULL,
	"rating_average" numeric(3, 2) DEFAULT '0' NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"first_published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"payment_id" uuid,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"thumbnail_url" varchar(500),
	"estimated_hours" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_paths_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_code_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"starter_code" text NOT NULL,
	"solution_code" text NOT NULL,
	"manual_solution" text,
	"language" varchar(30) NOT NULL,
	"test_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_code_content_lesson_id_unique" UNIQUE("lesson_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"last_position_secs" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"prompt_text" text NOT NULL,
	"model_used" varchar(20) NOT NULL,
	"context_note" varchar(500),
	"tag" varchar(30) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_video_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"mux_asset_id" varchar(255) NOT NULL,
	"mux_playback_id" varchar(255) NOT NULL,
	"transcript" text,
	"chapters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_video_content_lesson_id_unique" UNIQUE("lesson_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_written_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"content_md" text NOT NULL,
	"content_pidgin_md" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_written_content_lesson_id_unique" UNIQUE("lesson_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"type" varchar(30) NOT NULL,
	"duration_secs" integer,
	"xp_reward" integer DEFAULT 10 NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "live_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 90 NOT NULL,
	"stream_url" varchar(500),
	"recording_url" varchar(500),
	"course_id" uuid,
	"instructor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid,
	"subscription_id" uuid,
	"promo_code_id" uuid,
	"amount" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"provider" varchar(20) NOT NULL,
	"provider_reference" varchar(255) NOT NULL,
	"invoice_url" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(20) NOT NULL,
	"value" integer NOT NULL,
	"currency" char(3),
	"course_id" uuid,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompt_lab_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"prompt_text" text NOT NULL,
	"model_used" varchar(20) NOT NULL,
	"output" text NOT NULL,
	"precision_score" integer NOT NULL,
	"efficiency_score" integer NOT NULL,
	"completion_score" integer NOT NULL,
	"total_score" integer NOT NULL,
	"scoring_rationale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"max_score" integer NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ai_feedback" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"options" jsonb,
	"correct_answer" text,
	"grading_rubric" text,
	"points" integer DEFAULT 10 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" varchar(20) NOT NULL,
	"currency" char(3) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"pause_collection_until" timestamp with time zone,
	"stripe_subscription_id" varchar(255),
	"paystack_subscription_code" varchar(255),
	"cancelled_at" timestamp with time zone,
	"cancel_reason" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "subscriptions_paystack_subscription_code_unique" UNIQUE("paystack_subscription_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "talent_pipeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"capstone_project_id" uuid NOT NULL,
	"skill_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'flagged' NOT NULL,
	"referred_to_orion_at" timestamp with time zone,
	"orion_event_id" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_prompt_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_prompt_id" uuid,
	"prompt_text" text NOT NULL,
	"model_used" varchar(20) NOT NULL,
	"tag" varchar(30),
	"custom_label" varchar(100),
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"avatar_url" varchar(500),
	"role" varchar(20) DEFAULT 'student' NOT NULL,
	"country_code" char(2) DEFAULT 'NG' NOT NULL,
	"currency" char(3) DEFAULT 'NGN' NOT NULL,
	"language_preference" varchar(10) DEFAULT 'en' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"email_verify_token" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_expires_at" timestamp with time zone,
	"google_oauth_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"paystack_customer_code" varchar(255),
	"refresh_token" varchar(500),
	"xp_total" integer DEFAULT 0 NOT NULL,
	"streak_current" integer DEFAULT 0 NOT NULL,
	"streak_last_activity" date,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_answers" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_google_oauth_id_unique" UNIQUE("google_oauth_id"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_paystack_customer_code_unique" UNIQUE("paystack_customer_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"xp_amount" integer NOT NULL,
	"reference_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_tutor_conversations" ADD CONSTRAINT "ai_tutor_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_tutor_conversations" ADD CONSTRAINT "ai_tutor_conversations_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_projects" ADD CONSTRAINT "capstone_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capstone_projects" ADD CONSTRAINT "capstone_projects_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_code_content" ADD CONSTRAINT "lesson_code_content_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_prompts" ADD CONSTRAINT "lesson_prompts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_video_content" ADD CONSTRAINT "lesson_video_content_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_written_content" ADD CONSTRAINT "lesson_written_content_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prompt_lab_attempts" ADD CONSTRAINT "prompt_lab_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prompt_lab_attempts" ADD CONSTRAINT "prompt_lab_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "talent_pipeline" ADD CONSTRAINT "talent_pipeline_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "talent_pipeline" ADD CONSTRAINT "talent_pipeline_capstone_project_id_capstone_projects_id_fk" FOREIGN KEY ("capstone_project_id") REFERENCES "public"."capstone_projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_prompt_library" ADD CONSTRAINT "user_prompt_library_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_prompt_library" ADD CONSTRAINT "user_prompt_library_source_prompt_id_lesson_prompts_id_fk" FOREIGN KEY ("source_prompt_id") REFERENCES "public"."lesson_prompts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ai_tutor_user_lesson" ON "ai_tutor_conversations" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_tutor_user_lesson" ON "ai_tutor_conversations" ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_capstone_user_course" ON "capstone_projects" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_capstone_status" ON "capstone_projects" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_capstone_pipeline" ON "capstone_projects" ("is_talent_pipeline_flagged");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_certificates_user_course" ON "certificates" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_slug" ON "courses" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_category" ON "courses" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_level" ON "courses" ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_instructor" ON "courses" ("instructor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_published" ON "courses" ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_enrollments_user_course" ON "enrollments" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_enrollments_user" ON "enrollments" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_enrollments_course" ON "enrollments" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_lesson_progress_user_lesson" ON "lesson_progress" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_user" ON "lesson_progress" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_lesson" ON "lesson_progress" ("lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lesson_prompts_lesson" ON "lesson_prompts" ("lesson_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lessons_section" ON "lessons" ("section_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lessons_type" ON "lessons" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_user" ON "payments" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_reference" ON "payments" ("provider_reference");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prompt_lab_user_lesson" ON "prompt_lab_attempts" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_user_lesson" ON "quiz_attempts" ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quiz_questions_lesson" ON "quiz_questions" ("lesson_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sections_course" ON "sections" ("course_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_badges" ON "user_badges" ("user_id","badge_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prompt_library_user" ON "user_prompt_library" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_xp_events_user" ON "xp_events" ("user_id");