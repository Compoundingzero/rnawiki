CREATE TABLE "hub_aliases" (
	"alias_type" "corpus_hub_type" NOT NULL,
	"alias_slug" varchar(200) NOT NULL,
	"alias_name" text NOT NULL,
	"hub_id" varchar(200) NOT NULL,
	"shared_members" integer NOT NULL,
	"alias_member_count" integer NOT NULL,
	CONSTRAINT "hub_aliases_type_slug_pk" PRIMARY KEY("alias_type","alias_slug"),
	CONSTRAINT "hub_aliases_slug_shape" CHECK ("hub_aliases"."alias_slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "hub_aliases_shared_members" CHECK ("hub_aliases"."shared_members" >= 0)
);
--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "duplicate_hold_of" varchar(200);--> statement-breakpoint
ALTER TABLE "page_registration" ADD COLUMN "disclosed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hub_aliases" ADD CONSTRAINT "hub_aliases_hub_id_hubs_hub_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("hub_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hub_aliases_hub_idx" ON "hub_aliases" USING btree ("hub_id");