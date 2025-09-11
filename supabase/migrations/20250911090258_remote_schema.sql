

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."increment_category_count"("category_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE categories
  SET 
    memory_count = memory_count + 1,
    updated_at = NOW()
  WHERE id = category_id;
END;
$$;


ALTER FUNCTION "public"."increment_category_count"("category_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_all_category_counts"("wedding_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  cat RECORD;
BEGIN
  FOR cat IN 
    SELECT id FROM categories WHERE wedding_id = recalculate_all_category_counts.wedding_id
  LOOP
    PERFORM recalculate_category_count(cat.id);
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."recalculate_all_category_counts"("wedding_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_category_count"("category_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_val
  FROM memories
  WHERE category_id = recalculate_category_count.category_id
    AND status = 'completed';
  
  UPDATE categories
  SET 
    memory_count = count_val,
    updated_at = NOW()
  WHERE id = recalculate_category_count.category_id;
END;
$$;


ALTER FUNCTION "public"."recalculate_category_count"("category_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bride_details" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(100),
    "email" character varying(255),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."bride_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "summary" "text",
    "memory_count" integer DEFAULT 0,
    "keywords" "text"[],
    "theme" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "memory_type" "text",
    CONSTRAINT "categories_memory_type_check" CHECK (("memory_type" = ANY (ARRAY['bride'::"text", 'groom'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groom_details" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(100),
    "email" character varying(255),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."groom_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "name" character varying(200) NOT NULL,
    "email" character varying(255),
    "phone" character varying(50),
    "side" character varying(10),
    "table_number" character varying(20),
    "rsvp_status" character varying(10),
    "imported_from" character varying(20),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "guests_rsvp_status_check" CHECK ((("rsvp_status")::"text" = ANY ((ARRAY['pending'::character varying, 'yes'::character varying, 'no'::character varying])::"text"[]))),
    CONSTRAINT "guests_side_check" CHECK ((("side")::"text" = ANY ((ARRAY['bride'::character varying, 'groom'::character varying, 'both'::character varying])::"text"[])))
);


ALTER TABLE "public"."guests" OWNER TO "postgres";


COMMENT ON TABLE "public"."guests" IS 'Guest list for weddings, supporting import from various sources';



COMMENT ON COLUMN "public"."guests"."side" IS 'Which side of the wedding party the guest belongs to';



COMMENT ON COLUMN "public"."guests"."imported_from" IS 'Source of the guest data (zola, manual, csv, etc.)';



CREATE TABLE IF NOT EXISTS "public"."memories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "guest_id" "uuid",
    "guest_name" character varying(100),
    "memory_text" "text" NOT NULL,
    "memory_type" character varying(20) DEFAULT 'both'::character varying,
    "group_id" "uuid",
    "ai_category" character varying(100),
    "ai_summary" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "processing_started_at" timestamp with time zone,
    "processing_completed_at" timestamp with time zone,
    "processing_error" "text",
    "category" character varying(255),
    "category_confidence" numeric(3,2),
    "categorization_metadata" "jsonb",
    "retry_count" integer DEFAULT 0,
    "category_id" "uuid",
    CONSTRAINT "memories_memory_type_check" CHECK ((("memory_type")::"text" = ANY ((ARRAY['bride'::character varying, 'groom'::character varying, 'both'::character varying])::"text"[]))),
    CONSTRAINT "memories_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'failed_permanent'::character varying])::"text"[])))
);


ALTER TABLE "public"."memories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."memories"."status" IS 'Tracks memory processing state: 
pending (just submitted), processing (AI categorization in progress), 
completed (categorized), failed (processing error)';



COMMENT ON COLUMN "public"."memories"."category" IS 'Event-based category for grouping 
related memories';



COMMENT ON COLUMN "public"."memories"."category_confidence" IS 'AI confidence score for
  categorization (0-1)';



COMMENT ON COLUMN "public"."memories"."categorization_metadata" IS 'JSON metadata about
  categorization decision';



CREATE TABLE IF NOT EXISTS "public"."memory_embeddings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "memory_id" "uuid" NOT NULL,
    "qdrant_point_id" "uuid" NOT NULL,
    "embedding_model" character varying(100) DEFAULT 'text-embedding-004'::character varying,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."memory_embeddings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."memory_groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "title" character varying(200) NOT NULL,
    "summary" "text",
    "memory_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."memory_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."memory_photos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "memory_id" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "url" "text" NOT NULL,
    "thumbnail_url" "text",
    "width" integer,
    "height" integer,
    "size_bytes" integer,
    "mime_type" character varying(50),
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."memory_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wedding_google_drive" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "google_email" "text" NOT NULL,
    "google_name" "text",
    "access_token" "text" NOT NULL,
    "refresh_token" "text" NOT NULL,
    "token_expires_at" timestamp with time zone NOT NULL,
    "connected_at" timestamp with time zone DEFAULT "now"(),
    "connected_by" "uuid",
    "is_active" boolean DEFAULT true,
    "folder_id" "text",
    "last_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wedding_google_drive" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wedding_guests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wedding_id" "uuid" NOT NULL,
    "first_name" character varying(100) DEFAULT ''::character varying,
    "last_name" character varying(100) DEFAULT ''::character varying,
    "full_name" character varying(200) GENERATED ALWAYS AS (((("first_name")::"text" || ' '::"text") || ("last_name")::"text")) STORED,
    "email" character varying(255),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "phone" character varying,
    "table_number" character varying,
    "party_name" character varying,
    "party_size" integer DEFAULT 1,
    "rsvp_status" character varying,
    "dietary_restrictions" "text",
    "notes" "text"
);


ALTER TABLE "public"."wedding_guests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weddings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" character varying(100) NOT NULL,
    "wedding_date" "date",
    "theme_color" character varying(7) DEFAULT '#ec4899'::character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "groom_id" "uuid",
    "bride_id" "uuid",
    "secondary_color" character varying(7),
    "font_family" character varying(100),
    "background_style" character varying(20),
    CONSTRAINT "weddings_background_style_check" CHECK ((("background_style")::"text" = ANY ((ARRAY['solid'::character varying, 'gradient'::character varying, 'pattern'::character varying])::"text"[])))
);


ALTER TABLE "public"."weddings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bride_details"
    ADD CONSTRAINT "bride_details_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."bride_details"
    ADD CONSTRAINT "bride_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_wedding_id_name_key" UNIQUE ("wedding_id", "name");



ALTER TABLE ONLY "public"."groom_details"
    ADD CONSTRAINT "groom_details_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."groom_details"
    ADD CONSTRAINT "groom_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guests"
    ADD CONSTRAINT "guests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memory_embeddings"
    ADD CONSTRAINT "memory_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memory_groups"
    ADD CONSTRAINT "memory_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memory_photos"
    ADD CONSTRAINT "memory_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wedding_google_drive"
    ADD CONSTRAINT "wedding_google_drive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wedding_google_drive"
    ADD CONSTRAINT "wedding_google_drive_wedding_id_key" UNIQUE ("wedding_id");



ALTER TABLE ONLY "public"."wedding_guests"
    ADD CONSTRAINT "wedding_guests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weddings"
    ADD CONSTRAINT "weddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weddings"
    ADD CONSTRAINT "weddings_slug_key" UNIQUE ("slug");



CREATE INDEX "idx_bride_details_email" ON "public"."bride_details" USING "btree" ("email");



CREATE INDEX "idx_bride_details_wedding_id" ON "public"."bride_details" USING "btree" ("wedding_id");



CREATE INDEX "idx_categories_memory_type" ON "public"."categories" USING "btree" ("wedding_id", "memory_type");



CREATE INDEX "idx_categories_name" ON "public"."categories" USING "btree" ("name");



CREATE INDEX "idx_categories_wedding_id" ON "public"."categories" USING "btree" ("wedding_id");



CREATE INDEX "idx_groom_details_email" ON "public"."groom_details" USING "btree" ("email");



CREATE INDEX "idx_groom_details_wedding_id" ON "public"."groom_details" USING "btree" ("wedding_id");



CREATE INDEX "idx_guests_email" ON "public"."guests" USING "btree" ("email");



CREATE INDEX "idx_guests_name" ON "public"."guests" USING "btree" ("name");



CREATE INDEX "idx_guests_wedding_id" ON "public"."guests" USING "btree" ("wedding_id");



CREATE INDEX "idx_memories_category" ON "public"."memories" USING "btree" ("wedding_id", "category") WHERE ("category" IS NOT NULL);



CREATE INDEX "idx_memories_category_id" ON "public"."memories" USING "btree" ("category_id");



CREATE INDEX "idx_memories_created_at" ON "public"."memories" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_memories_group_id" ON "public"."memories" USING "btree" ("group_id");



CREATE INDEX "idx_memories_guest_id" ON "public"."memories" USING "btree" ("guest_id");



CREATE INDEX "idx_memories_status_retry" ON "public"."memories" USING "btree" ("wedding_id", "status", "retry_count") WHERE (("status")::"text" = ANY ((ARRAY['pending'::character varying, 'failed'::character varying])::"text"[]));



CREATE INDEX "idx_memories_wedding_id" ON "public"."memories" USING "btree" ("wedding_id");



CREATE UNIQUE INDEX "idx_memory_embeddings_memory_id" ON "public"."memory_embeddings" USING "btree" ("memory_id");



CREATE INDEX "idx_memory_groups_wedding_id" ON "public"."memory_groups" USING "btree" ("wedding_id");



CREATE INDEX "idx_memory_photos_memory_id" ON "public"."memory_photos" USING "btree" ("memory_id");



CREATE INDEX "idx_wedding_google_drive_active" ON "public"."wedding_google_drive" USING "btree" ("is_active");



CREATE INDEX "idx_wedding_google_drive_wedding_id" ON "public"."wedding_google_drive" USING "btree" ("wedding_id");



CREATE INDEX "idx_wedding_guests_full_name" ON "public"."wedding_guests" USING "btree" ("full_name");



CREATE INDEX "idx_wedding_guests_rsvp" ON "public"."wedding_guests" USING "btree" ("rsvp_status");



CREATE INDEX "idx_wedding_guests_wedding_id" ON "public"."wedding_guests" USING "btree" ("wedding_id");



CREATE INDEX "idx_weddings_bride_id" ON "public"."weddings" USING "btree" ("bride_id");



CREATE INDEX "idx_weddings_groom_id" ON "public"."weddings" USING "btree" ("groom_id");



CREATE INDEX "idx_weddings_slug" ON "public"."weddings" USING "btree" ("slug");



CREATE OR REPLACE TRIGGER "update_bride_details_updated_at" BEFORE UPDATE ON "public"."bride_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_groom_details_updated_at" BEFORE UPDATE ON "public"."groom_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_guests_updated_at" BEFORE UPDATE ON "public"."guests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_memories_updated_at" BEFORE UPDATE ON "public"."memories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_memory_groups_updated_at" BEFORE UPDATE ON "public"."memory_groups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_wedding_google_drive_updated_at" BEFORE UPDATE ON "public"."wedding_google_drive" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_wedding_guests_updated_at" BEFORE UPDATE ON "public"."wedding_guests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_weddings_updated_at" BEFORE UPDATE ON "public"."weddings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."bride_details"
    ADD CONSTRAINT "bride_details_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groom_details"
    ADD CONSTRAINT "groom_details_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guests"
    ADD CONSTRAINT "guests_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."wedding_guests"("id");



ALTER TABLE ONLY "public"."memories"
    ADD CONSTRAINT "memories_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memory_embeddings"
    ADD CONSTRAINT "memory_embeddings_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "public"."memories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memory_groups"
    ADD CONSTRAINT "memory_groups_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memory_photos"
    ADD CONSTRAINT "memory_photos_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "public"."memories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wedding_google_drive"
    ADD CONSTRAINT "wedding_google_drive_connected_by_fkey" FOREIGN KEY ("connected_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."wedding_google_drive"
    ADD CONSTRAINT "wedding_google_drive_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wedding_guests"
    ADD CONSTRAINT "wedding_guests_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weddings"
    ADD CONSTRAINT "weddings_bride_id_fkey" FOREIGN KEY ("bride_id") REFERENCES "public"."bride_details"("id");



ALTER TABLE ONLY "public"."weddings"
    ADD CONSTRAINT "weddings_groom_id_fkey" FOREIGN KEY ("groom_id") REFERENCES "public"."groom_details"("id");



CREATE POLICY "Anyone can insert categories" ON "public"."categories" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "Anyone can insert categories" ON "public"."categories" IS 'Public insert - API creates categories when processing memories';



CREATE POLICY "Anyone can insert memory photos" ON "public"."memory_photos" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can update categories" ON "public"."categories" FOR UPDATE USING (true) WITH CHECK (true);



COMMENT ON POLICY "Anyone can update categories" ON "public"."categories" IS 'Public update - API updates summaries and counts when memories are added';



CREATE POLICY "Anyone can view categories" ON "public"."categories" FOR SELECT USING (true);



COMMENT ON POLICY "Anyone can view categories" ON "public"."categories" IS 'Public read access - guests can view all categories without authentication';



CREATE POLICY "Anyone can view memory photos" ON "public"."memory_photos" FOR SELECT USING (true);



CREATE POLICY "Public can add photos to memories" ON "public"."memory_photos" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."memories"
     JOIN "public"."weddings" ON (("weddings"."id" = "memories"."wedding_id")))
  WHERE (("memories"."id" = "memory_photos"."memory_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can create memories for active weddings" ON "public"."memories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."id" = "memories"."wedding_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view active weddings" ON "public"."weddings" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view bride details" ON "public"."bride_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."bride_id" = "bride_details"."id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view groom details" ON "public"."groom_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."groom_id" = "groom_details"."id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view memories from active weddings" ON "public"."memories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."id" = "memories"."wedding_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view memory groups" ON "public"."memory_groups" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."id" = "memory_groups"."wedding_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view memory photos" ON "public"."memory_photos" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."memories"
     JOIN "public"."weddings" ON (("weddings"."id" = "memories"."wedding_id")))
  WHERE (("memories"."id" = "memory_photos"."memory_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view wedding guests" ON "public"."guests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."id" = "guests"."wedding_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Public can view wedding guests" ON "public"."wedding_guests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."weddings"
  WHERE (("weddings"."id" = "wedding_guests"."wedding_id") AND ("weddings"."is_active" = true)))));



CREATE POLICY "Service role manages bride details" ON "public"."bride_details" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages embeddings" ON "public"."memory_embeddings" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages groom details" ON "public"."groom_details" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages groups" ON "public"."memory_groups" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages guests" ON "public"."guests" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages guests" ON "public"."wedding_guests" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages memories" ON "public"."memories" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages photos" ON "public"."memory_photos" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role manages weddings" ON "public"."weddings" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Users can manage their wedding's Google Drive connection" ON "public"."wedding_google_drive" USING (true);



ALTER TABLE "public"."bride_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groom_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memory_embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memory_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memory_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wedding_google_drive" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wedding_guests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weddings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."increment_category_count"("category_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_category_count"("category_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_category_count"("category_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."recalculate_all_category_counts"("wedding_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."recalculate_all_category_counts"("wedding_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalculate_all_category_counts"("wedding_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."recalculate_category_count"("category_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."recalculate_category_count"("category_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalculate_category_count"("category_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."bride_details" TO "anon";
GRANT ALL ON TABLE "public"."bride_details" TO "authenticated";
GRANT ALL ON TABLE "public"."bride_details" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."groom_details" TO "anon";
GRANT ALL ON TABLE "public"."groom_details" TO "authenticated";
GRANT ALL ON TABLE "public"."groom_details" TO "service_role";



GRANT ALL ON TABLE "public"."guests" TO "anon";
GRANT ALL ON TABLE "public"."guests" TO "authenticated";
GRANT ALL ON TABLE "public"."guests" TO "service_role";



GRANT ALL ON TABLE "public"."memories" TO "anon";
GRANT ALL ON TABLE "public"."memories" TO "authenticated";
GRANT ALL ON TABLE "public"."memories" TO "service_role";



GRANT ALL ON TABLE "public"."memory_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."memory_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."memory_embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."memory_groups" TO "anon";
GRANT ALL ON TABLE "public"."memory_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."memory_groups" TO "service_role";



GRANT ALL ON TABLE "public"."memory_photos" TO "anon";
GRANT ALL ON TABLE "public"."memory_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."memory_photos" TO "service_role";



GRANT ALL ON TABLE "public"."wedding_google_drive" TO "anon";
GRANT ALL ON TABLE "public"."wedding_google_drive" TO "authenticated";
GRANT ALL ON TABLE "public"."wedding_google_drive" TO "service_role";



GRANT ALL ON TABLE "public"."wedding_guests" TO "anon";
GRANT ALL ON TABLE "public"."wedding_guests" TO "authenticated";
GRANT ALL ON TABLE "public"."wedding_guests" TO "service_role";



GRANT ALL ON TABLE "public"."weddings" TO "anon";
GRANT ALL ON TABLE "public"."weddings" TO "authenticated";
GRANT ALL ON TABLE "public"."weddings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
