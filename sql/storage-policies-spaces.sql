-- spaces bucket (for space photos - public)

-- READ
-- All users can read all files
(bucket_id = 'spaces':: text)

-- INSERT/UPDATE/DELETE
-- Space Users with "update" permission can write
(
  (bucket_id = 'spaces':: text)
  AND (
    EXISTS (
      SELECT
        space_users.user_id,
        space_users.space_id
      FROM
        (
          space_users
          LEFT JOIN permissions_with_role ON (
            (
              (space_users.role_name):: text = (permissions_with_role.role_name):: text
            )
          )
        )
      WHERE
        (
          ((space_users.user_id):: text = (uid()):: text)
          AND (
            space_users.space_id = ((storage.foldername(objects.name)) [ 1 ]):: integer
          )
          AND (permissions_with_role.update = true)
        )
    )
  )
)