-- studios bucket (for studio photos - public)

-- READ
-- All users can read all files
(bucket_id = 'studios':: text)

-- INSERT/UPDATE/DELETE
-- Studio Users with "update" permission can write
(
  (bucket_id = 'studios':: text)
  AND (
    EXISTS (
      SELECT
        studio_users.user_id,
        studio_users.studio_id
      FROM
        (
          studio_users
          LEFT JOIN permissions_with_role ON (
            (
              (studio_users.role_name):: text = (permissions_with_role.role_name):: text
            )
          )
        )
      WHERE
        (
          ((studio_users.user_id):: text = (uid()):: text)
          AND (
            studio_users.studio_id = ((storage.foldername(objects.name)) [ 1 ]):: integer
          )
          AND (permissions_with_role.update = true)
        )
    )
  )
)