CREATE TYPE "public"."alias_kind" AS ENUM('inn', 'usan', 'ban', 'brand', 'salt_form', 'common_name', 'systematic');--> statement-breakpoint
CREATE TABLE "drug_aliases" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"alias" varchar(300) NOT NULL,
	"kind" "alias_kind" DEFAULT 'common_name' NOT NULL,
	"source" varchar(160) DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drug_aliases" ADD CONSTRAINT "drug_aliases_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "drug_aliases_unique" ON "drug_aliases" USING btree ("drug_id",lower("alias"));--> statement-breakpoint
CREATE INDEX "drug_aliases_alias_idx" ON "drug_aliases" USING btree (lower("alias"));--> statement-breakpoint
CREATE INDEX "drug_aliases_drug_idx" ON "drug_aliases" USING btree ("drug_id");