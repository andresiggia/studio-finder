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