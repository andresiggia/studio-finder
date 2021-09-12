CREATE TABLE "settings" (
  "key" varchar PRIMARY KEY,
  "value" jsonb,
);

CREATE TABLE "users" (
  "id" varchar PRIMARY KEY,
  "name" varchar,
  "surname" varchar,
  "birthday" date,
  "photo_url" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "studios" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar,
  "description" varchar,
  "address" varchar,
  "latitude" float8,
  "longitude" float8,
  "inactive" boolean,
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
  "role_name" varchar,
  PRIMARY KEY ("studio_id", "user_id")
);

CREATE TABLE "spaces" (
  "id" SERIAL PRIMARY KEY,
  "studio_id" int,
  "title" varchar,
  "description" varchar,
  "inactive" boolean,
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
  "role_name" varchar,
  PRIMARY KEY ("space_id", "user_id")
);

CREATE TABLE "services" (
  "type" varchar PRIMARY KEY,
  "title" varchar
);

CREATE TABLE "space_services" (
  "space_id" int,
  "service_type" varchar,
  "title" varchar,
  "price" float8,
  PRIMARY KEY ("space_id", "title")
);

CREATE TABLE "bookings" (
  "id" SERIAL PRIMARY KEY,
  "studio_id" int,
  "user_id" varchar,
  "created_by" varchar,
  "modified_by" varchar,
  "notes" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "booking_items" (
  "id" SERIAL PRIMARY KEY,
  "inactive" boolean,
  "booking_id" int,
  "space_id" int,
  "service_type" varchar,
  "service_title" varchar,
  "service_price" float8,
  "start_at" timestamp,
  "end_at" timestamp,
  "notes" varchar,
  "quantity" float8
);

CREATE TABLE "permissions" (
  "id" SERIAL PRIMARY KEY,
  "role_name" varchar,
  "entity" varchar,
  "read" boolean,
  "insert" boolean,
  "update" boolean,
  "delete" boolean
);

CREATE TABLE "roles" (
  "name" varchar PRIMARY KEY,
  "title" varchar,
  "type" varchar
);

ALTER TABLE "permissions" ADD FOREIGN KEY ("role_name") REFERENCES "roles" ("name");

ALTER TABLE "studio_photos" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "studio_users" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "studio_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "studio_users" ADD FOREIGN KEY ("role_name") REFERENCES "roles" ("name");

ALTER TABLE "spaces" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "space_photos" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "space_users" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "space_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "space_users" ADD FOREIGN KEY ("role_name") REFERENCES "roles" ("name");

ALTER TABLE "space_services" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "space_services" ADD FOREIGN KEY ("service_type") REFERENCES "services" ("type");

ALTER TABLE "bookings" ADD FOREIGN KEY ("studio_id") REFERENCES "studios" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("modified_by") REFERENCES "users" ("id");

ALTER TABLE "booking_items" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_items" ADD FOREIGN KEY ("space_id") REFERENCES "spaces" ("id");

ALTER TABLE "booking_items" ADD FOREIGN KEY ("service_type") REFERENCES "services" ("type");
