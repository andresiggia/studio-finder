import { AppContextValue } from '../../context/AppContext';

export enum StorageBucket {
  users = 'users',
  spaces = 'spaces',
  studios = 'studios',
}

export const getFileUrl = (context: AppContextValue, {
  filePath, bucketName,
}: {
  filePath: string, bucketName: string,
}) => {
  const { supabase } = context;
  return supabase
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);
};

export const uploadFile = (context: AppContextValue, {
  filePath, fileBody, bucketName,
}: {
  filePath: string, fileBody: any, bucketName: string,
}) => {
  const { supabase } = context;
  return supabase
    .storage
    .from(bucketName)
    .upload(filePath, fileBody, {
      upsert: true,
    });
};

export const deleteFile = (context: AppContextValue, {
  filePath, bucketName,
}: {
  filePath: string, bucketName: string,
}) => {
  const { supabase } = context;
  return supabase
    .storage
    .from(bucketName)
    .remove([filePath]);
};
