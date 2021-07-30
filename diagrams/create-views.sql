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
