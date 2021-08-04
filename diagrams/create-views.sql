DROP VIEW IF EXISTS roles;
CREATE VIEW roles AS (
  SELECT 'studio_roles' as "table_name", * FROM studio_roles
  UNION (
    SELECT 'space_roles' as "table_name", * FROM space_roles
    UNION (
      SELECT 'user_roles' as "table_name", * FROM user_roles
    )
  )
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

DROP VIEW IF EXISTS bookings_with_user;
CREATE VIEW bookings_with_user AS (
  SELECT bookings.*,
    studios.title as "studio_title",
    users.name as "user_name", users.surname as "user_surname",
    acts.title as "act_title"
  FROM bookings
  LEFT JOIN studios ON bookings.studio_id = studios.id
  LEFT JOIN users ON bookings.user_id = users.id
  LEFT JOIN acts ON bookings.act_id = acts.id
);

DROP VIEW IF EXISTS booking_items_with_booking;
CREATE VIEW booking_items_with_booking AS (
  SELECT booking_items.*,
    bookings_with_user.user_id, bookings_with_user.user_name, bookings_with_user.user_surname,
    bookings_with_user.studio_id, bookings_with_user.studio_title,
    bookings_with_user.act_id, bookings_with_user.act_title
  FROM booking_items
  LEFT JOIN bookings_with_user ON bookings_with_user.id = booking_items.booking_id
);