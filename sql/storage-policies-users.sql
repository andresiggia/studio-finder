-- users bucket (for profile photos - public)

-- READ
-- all users can view all files
(bucket_id = 'users':: text)

-- INSERT/UPDATE/DELETE
-- all users can manipulate files in their own folders
(
  (bucket_id = 'users':: text)
  AND ((storage.foldername(name)) [ 1 ] = (uid()):: text)
)
