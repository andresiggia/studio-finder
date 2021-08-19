drop function if exists get_studios_with_distance;
create or replace function get_studios_with_distance(lat float8, lon float8)   
RETURNS TABLE(
  "id" int,
  "title" varchar,
  "description" varchar,
  "address" varchar,
  "city" varchar,
  "country" varchar,
  "latitude" float8,
  "longitude" float8,
  "inactive" boolean,
  "created_at" timestamp,
  "modified_at" timestamp,
  "photo_url" varchar,
  "distance" float8
) AS
$BODY$
  SELECT 
    "id",
    "title",
    "description",
    "address",
    "city",
    "country",
    "latitude",
    "longitude",
    "inactive",
    "created_at",
    "modified_at",
    "photo_url",
    3956 * 2 * ASIN(SQRT(POWER(SIN((lat - studios_list.latitude) * pi()/180 / 2), 2) + COS(lat * pi()/180) * COS(studios_list.latitude * pi()/180) * POWER(SIN((lon - studios_list.longitude) * pi()/180 / 2), 2))) AS distance
  FROM studios_list
$BODY$
language sql;