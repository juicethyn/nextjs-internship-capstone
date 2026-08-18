CREATE TYPE "public"."event_type" AS ENUM('meeting', 'planning', 'review', 'presentation', 'discussion', 'other');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"event_type" "event_type" DEFAULT 'meeting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_project_id_index" ON "events" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "events_created_by_id_index" ON "events" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "events_start_at_index" ON "events" USING btree ("start_at");