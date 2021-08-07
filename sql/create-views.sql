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

DROP VIEW IF EXISTS studios_with_user_id;
CREATE VIEW studios_with_user_id AS (
  SELECT studio_users.user_id, studios.*
  FROM studio_users, studios
  WHERE studio_users.studio_id = studios.id
);

DROP VIEW IF EXISTS booking_items_with_booking;
CREATE VIEW booking_items_with_booking AS (
  SELECT booking_items.*,
    spaces.title as "space_title",
    bookings_with_user.user_id, bookings_with_user.user_name, bookings_with_user.user_surname,
    bookings_with_user.created_by, bookings_with_user.created_by_name, bookings_with_user.created_by_surname,
    bookings_with_user.modified_by, bookings_with_user.modified_by_name, bookings_with_user.modified_by_surname,
    bookings_with_user.studio_id, bookings_with_user.studio_title,
    bookings_with_user.act_id, bookings_with_user.act_title
  FROM booking_items
  LEFT JOIN spaces ON booking_items.space_id = spaces.id
  LEFT JOIN bookings_with_user ON bookings_with_user.id = booking_items.booking_id
);

DROP VIEW IF EXISTS bookings_with_user;
CREATE VIEW bookings_with_user AS (
  SELECT bookings.*,
    studios.title as "studio_title",
    users.name as "user_name", users.surname as "user_surname",
    users_created_by.name as "created_by_name", users_created_by.surname as "created_by_surname",
    users_modified_by.name as "modified_by_name", users_modified_by.surname as "modified_by_surname",
    acts.title as "act_title"
  FROM bookings
  LEFT JOIN studios ON bookings.studio_id = studios.id
  LEFT JOIN users ON bookings.user_id = users.id
  LEFT JOIN users as users_created_by ON bookings.created_by = users_created_by.id
  LEFT JOIN users as users_modified_by ON bookings.modified_by = users_modified_by.id
  LEFT JOIN acts ON bookings.act_id = acts.id
);