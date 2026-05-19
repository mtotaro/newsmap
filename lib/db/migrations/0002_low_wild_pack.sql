CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"digest_enabled" boolean DEFAULT false NOT NULL,
	"digest_hour" integer DEFAULT 7 NOT NULL,
	"digest_unsubscribe_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_digest_unsubscribe_token_unique" UNIQUE("digest_unsubscribe_token")
);
