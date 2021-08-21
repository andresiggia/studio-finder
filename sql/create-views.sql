DROP VIEW IF EXISTS permissions_with_role;
CREATE VIEW permissions_with_role AS (
  SELECT permissions.*, roles.title as "role_title", roles.type as "role_type"
  FROM permissions
  LEFT JOIN roles
  ON roles.name = permissions.role_name
);

DROP VIEW IF EXISTS spaces_with_user_id;
CREATE VIEW spaces_with_user_id AS (
  SELECT space_users.user_id, spaces.*
  FROM space_users, spaces
  WHERE space_users.space_id = spaces.id
);

DROP VIEW IF EXISTS studios_by_user;
CREATE VIEW studios_by_user AS (
  SELECT studio_users.*, studios.*
  FROM studio_users
  LEFT JOIN studios
  ON studio_users.studio_id = studios.id
  WHERE EXISTS (
    SELECT "id"
    FROM permissions_with_role
    WHERE "read" = true
      AND "entity" = 'studios'
      AND role_name = studio_users.role_name
  )
);

DROP VIEW IF EXISTS studios_list;
CREATE VIEW studios_list AS (
  SELECT studios.*, first_studio_photo.first_photo_url as photo_url
  FROM studios
  LEFT JOIN (
    SELECT studio_id, first_photo_url
    FROM (
      SELECT studio_id,
      FIRST_VALUE(photo_url)
      OVER(
        PARTITION BY studio_id
        ORDER BY "order", "id"
      ) first_photo_url
      FROM studio_photos
    ) as first_studio_photo
    GROUP BY studio_id, first_photo_url
  ) as first_studio_photo
  ON studios.id = first_studio_photo.studio_id
);

DROP VIEW IF EXISTS spaces_list;
CREATE VIEW spaces_list AS (
  SELECT spaces.*, first_space_photo.first_photo_url as photo_url
  FROM spaces
  LEFT JOIN (
    SELECT space_id, first_photo_url
    FROM (
      SELECT space_id,
      FIRST_VALUE(photo_url)
      OVER(
        PARTITION BY space_id
        ORDER BY "order", "id"
      ) first_photo_url
      FROM space_photos
    ) as first_space_photo
    GROUP BY space_id, first_photo_url
  ) as first_space_photo
  ON spaces.id = first_space_photo.space_id
);

DROP VIEW IF EXISTS bookings_with_user;
CREATE VIEW bookings_with_user AS (
  SELECT bookings.*,
    studios.title as "studio_title",
    users.name as "user_name", users.surname as "user_surname",
    users_created_by.name as "created_by_name", users_created_by.surname as "created_by_surname",
    users_modified_by.name as "modified_by_name", users_modified_by.surname as "modified_by_surname"
  FROM bookings
  LEFT JOIN studios ON bookings.studio_id = studios.id
  LEFT JOIN users ON bookings.user_id = users.id
  LEFT JOIN users as users_created_by ON bookings.created_by = users_created_by.id
  LEFT JOIN users as users_modified_by ON bookings.modified_by = users_modified_by.id
);

DROP VIEW IF EXISTS booking_items_with_booking;
CREATE VIEW booking_items_with_booking AS (
  SELECT booking_items.*,
    spaces.title as "space_title",
    bookings_with_user.user_id, bookings_with_user.user_name, bookings_with_user.user_surname,
    bookings_with_user.created_by, bookings_with_user.created_by_name, bookings_with_user.created_by_surname,
    bookings_with_user.modified_by, bookings_with_user.modified_by_name, bookings_with_user.modified_by_surname,
    bookings_with_user.studio_id, bookings_with_user.studio_title
  FROM booking_items
  LEFT JOIN spaces ON booking_items.space_id = spaces.id
  LEFT JOIN bookings_with_user ON bookings_with_user.id = booking_items.booking_id
);