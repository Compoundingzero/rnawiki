CREATE TYPE "public"."medicine_slug_redirect_reason" AS ENUM('RENAMED', 'MERGED');--> statement-breakpoint
CREATE TABLE "medicine_slug_redirects" (
	"old_slug" varchar(128) PRIMARY KEY NOT NULL,
	"target_drug_id" varchar(96) NOT NULL,
	"reason" "medicine_slug_redirect_reason" NOT NULL,
	"rationale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medicine_slug_redirects_slug_shape" CHECK ("medicine_slug_redirects"."old_slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "medicine_slug_redirects_rationale_nonempty" CHECK (nullif(btrim("medicine_slug_redirects"."rationale"), '') is not null)
);
--> statement-breakpoint
ALTER TABLE "medicine_slug_redirects" ADD CONSTRAINT "medicine_slug_redirects_target_drug_id_drugs_id_fk" FOREIGN KEY ("target_drug_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medicine_slug_redirects_target_idx" ON "medicine_slug_redirects" USING btree ("target_drug_id");