CREATE TABLE "contributor_public_settings" (
	"user_id" varchar(64) PRIMARY KEY NOT NULL,
	"appear_in_weekly_spotlight" boolean DEFAULT true NOT NULL,
	"show_social_links_in_spotlight" boolean DEFAULT false NOT NULL,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contributor_public_settings_social_links_array" CHECK (jsonb_typeof("contributor_public_settings"."social_links") = 'array' and jsonb_array_length("contributor_public_settings"."social_links") <= 4),
	CONSTRAINT "contributor_public_settings_social_opt_in" CHECK (not "contributor_public_settings"."show_social_links_in_spotlight" or jsonb_array_length("contributor_public_settings"."social_links") > 0)
);
--> statement-breakpoint
ALTER TABLE "contributor_public_settings" ADD CONSTRAINT "contributor_public_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;