CREATE TABLE "baseline_submissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"engagement_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"status" text NOT NULL,
	"submitted_by" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"respond_by" timestamp with time zone NOT NULL,
	"responded_by" text,
	"responded_at" timestamp with time zone,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "commitment_revisions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"commitment_id" uuid NOT NULL,
	"version_from" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"quantity" numeric(14, 3),
	"unit" text,
	"definition_of_done" text,
	"due_date" date,
	"exclusions" text,
	"price_minor" bigint,
	"trigger" text,
	"trigger_date" date,
	"terms_days" integer,
	"linked_commitment_id" uuid,
	"pro_rata" boolean DEFAULT true NOT NULL,
	"created_by_change_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"engagement_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"owed_by_side" text NOT NULL,
	"position" integer NOT NULL,
	"removed_in_version" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_invitations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"engagement_id" uuid NOT NULL,
	"party_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "engagement_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "engagement_parties" (
	"id" uuid PRIMARY KEY NOT NULL,
	"engagement_id" uuid NOT NULL,
	"side" text NOT NULL,
	"is_initiator" boolean NOT NULL,
	"workspace_id" uuid,
	"org_name" text NOT NULL,
	"rep_name" text,
	"rep_email" text
);
--> statement-breakpoint
CREATE TABLE "engagement_versions" (
	"engagement_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"cause" text NOT NULL,
	"change_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "engagement_versions_engagement_id_version_pk" PRIMARY KEY("engagement_id","version")
);
--> statement-breakpoint
CREATE TABLE "engagements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"initiator_workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_version" integer DEFAULT 0 NOT NULL,
	"response_windows" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "party_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"party_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"authority" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "baseline_submissions" ADD CONSTRAINT "baseline_submissions_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseline_submissions" ADD CONSTRAINT "baseline_submissions_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseline_submissions" ADD CONSTRAINT "baseline_submissions_responded_by_user_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitment_revisions" ADD CONSTRAINT "commitment_revisions_commitment_id_commitments_id_fk" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_invitations" ADD CONSTRAINT "engagement_invitations_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_invitations" ADD CONSTRAINT "engagement_invitations_party_id_engagement_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."engagement_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_invitations" ADD CONSTRAINT "engagement_invitations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_parties" ADD CONSTRAINT "engagement_parties_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_parties" ADD CONSTRAINT "engagement_parties_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_versions" ADD CONSTRAINT "engagement_versions_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_initiator_workspace_id_workspaces_id_fk" FOREIGN KEY ("initiator_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_party_id_engagement_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."engagement_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "baseline_submissions_seq_uq" ON "baseline_submissions" USING btree ("engagement_id","seq");--> statement-breakpoint
CREATE UNIQUE INDEX "baseline_submissions_one_open_uq" ON "baseline_submissions" USING btree ("engagement_id") WHERE "baseline_submissions"."status" = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "commitment_revisions_version_uq" ON "commitment_revisions" USING btree ("commitment_id","version_from");--> statement-breakpoint
CREATE INDEX "commitments_engagement_idx" ON "commitments" USING btree ("engagement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "engagement_parties_side_uq" ON "engagement_parties" USING btree ("engagement_id","side");--> statement-breakpoint
CREATE INDEX "engagements_workspace_idx" ON "engagements" USING btree ("initiator_workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "party_members_party_user_uq" ON "party_members" USING btree ("party_id","user_id");--> statement-breakpoint
CREATE INDEX "party_members_user_idx" ON "party_members" USING btree ("user_id");