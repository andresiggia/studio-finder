CREATE TABLE "settings" (
  "key" varchar PRIMARY KEY,
  "value" jsonb,
);

CREATE TABLE "users" (
  "id" varchar PRIMARY KEY,
  "name" varchar,
  "surname" varchar,
  "birthday" date,
  "post_code" varchar,
  "city" varchar,
  "region" varchar,
  "country" varchar,
  "photo_url" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "acts" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "act_users" (
  "act_id" int,
  "user_id" varchar,
  "user_role_name" varchar,
  PRIMARY KEY ("act_id", "user_id")
);

CREATE TABLE "payment_vendors" (
  "name" varchar PRIMARY KEY,
  "title" varchar
);

CREATE TABLE "user_payment_methods" (
  "id" SERIAL,
  "user_id" varchar,
  "title" varchar UNIQUE,
  "vendor" varchar,
  "metadata" jsonb,
  PRIMARY KEY ("id", "user_id")
);

CREATE TABLE "studios" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar,
  "description" varchar,
  "address1" varchar,
  "address2" varchar,
  "address3" varchar,
  "post_code" varchar,
  "city" varchar,
  "region" varchar,
  "country" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "studio_photos" (
  "id" SERIAL PRIMARY KEY,
  "studio_id" int,
  "photo_url" varchar,
  "order" int
);

CREATE TABLE "studio_users" (
  "studio_id" int,
  "user_id" varchar,
  "studio_role_name" varchar,
  PRIMARY KEY ("studio_id", "user_id")
);

CREATE TABLE "spaces" (
  "id" SERIAL PRIMARY KEY,
  "studio_id" int,
  "title" varchar,
  "description" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "space_photos" (
  "id" SERIAL PRIMARY KEY,
  "space_id" int,
  "photo_url" varchar,
  "order" int
);

CREATE TABLE "space_users" (
  "space_id" int,
  "user_id" varchar,
  "space_role_name" varchar,
  PRIMARY KEY ("space_id", "user_id")
);

CREATE TABLE "services" (
  "type" varchar PRIMARY KEY,
  "title" varchar
);

CREATE TABLE "studio_services" (
  "id" SERIAL PRIMARY KEY,
  "studio_id" int,
  "service_type" varchar,
  "title" varchar,
  "price" money
);

CREATE TABLE "space_services" (
  "id" SERIAL PRIMARY KEY,
  "space_id" int,
  "service_type" varchar,
  "title" varchar,
  "price" money
);

CREATE TABLE "bookings" (
  "id" SERIAL PRIMARY KEY,
  "studio_id" int,
  "user_id" varchar,
  "act_id" int,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "booking_payments" (
  "id" SERIAL PRIMARY KEY,
  "booking_id" int,
  "user_id" varchar,
  "vendor" varchar,
  "metadata" jsonb,
  "value" money,
  "is_paid" boolean,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "booking_items" (
  "booking_id" int,
  "space_id" int,
  "service_type" varchar,
  "service_title" varchar,
  "service_price" money,
  "start_at" timestamp,
  "end_at" timestamp,
  "quantity" int,
  PRIMARY KEY ("booking_id", "space_id")
);

CREATE TABLE "booking_reviews" (
  "booking_id" int,
  "space_id" int,
  "title" varchar,
  "description" varchar,
  "stars" int,
  "created_at" timestamp DEFAULT (now()),
  PRIMARY KEY ("booking_id", "space_id")
);

CREATE TABLE "booking_review_photos" (
  "id" SERIAL PRIMARY KEY,
  "booking_id" int,
  "space_id" int,
  "photo_url" varchar,
  "order" int
);

CREATE TABLE "studio_roles" (
  "name" varchar PRIMARY KEY,
  "title" varchar,
  "permissions" jsonb
);

CREATE TABLE "space_roles" (
  "name" varchar PRIMARY KEY,
  "title" varchar,
  "permissions" jsonb
);

CREATE TABLE "user_roles" (
  "name" varchar PRIMARY KEY,
  "title" varchar,
  "permissions" jsonb
);

ALTER TABLE "act_users" ADD FOREIGN KEY ("act_id") REFERENCES "acts" ("id");

ALTER TABLE "act_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "act_users" ADD FOREIGN KEY ("user_role_name") REFERENCES "user_roles" ("name");

ALTER TABLE "user_payment_methods" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_payment_methods" ADD FOREIGN KEY ("vendor") REFERENCES "payment_vendors" ("name");

ALTER TABLE "studio_photos" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "studio_users" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "studio_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "studio_users" ADD FOREIGN KEY ("studio_role_name") REFERENCES "studio_roles" ("name");

ALTER TABLE "spaces" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "space_photos" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "space_users" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "space_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "space_users" ADD FOREIGN KEY ("space_role_name") REFERENCES "space_roles" ("name");

ALTER TABLE "studio_services" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "studio_services" ADD FOREIGN KEY ("service_type") REFERENCES "services" ("type");

ALTER TABLE "space_services" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "space_services" ADD FOREIGN KEY ("service_type") REFERENCES "services" ("type");

ALTER TABLE "bookings" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("act_id") REFERENCES "acts" ("id");

ALTER TABLE "booking_payments" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_payments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "booking_payments" ADD FOREIGN KEY ("vendor") REFERENCES "payment_vendors" ("name");

ALTER TABLE "booking_items" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_items" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "booking_items" ADD FOREIGN KEY ("service_type") REFERENCES "services" ("type");

ALTER TABLE "booking_reviews" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_reviews" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "booking_review_photos" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_review_photos" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");


COMMENT ON COLUMN "studio_roles"."permissions" IS 'array';

COMMENT ON COLUMN "space_roles"."permissions" IS 'array';

COMMENT ON COLUMN "user_roles"."permissions" IS 'array';
