-- studios bucket (for studio photos - public)

-- READ
-- all users can access all files
(bucket_id = 'studios':: text)

-- INSERT/UPDATE/DELETE
-- users with "update" permission in their roles regarding that studio can manipulate any files
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