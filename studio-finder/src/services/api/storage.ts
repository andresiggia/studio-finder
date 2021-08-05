import { AppContextValue } from '../../context/AppContext';

export enum StorageBucket {
  users = 'users',
  spaces = 'spaces',
  studios = 'studios',
}

export const uploadFile = async (context: AppContextValue, {
  fileName, fileBody, bucketName,
}: {
  fileName: string, fileBody: any, bucketName: string,
}) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .upload(fileName, fileBody, {
      upsert: true,
    });
  if (error) {
    throw error;
  }
  return data;
};

export const deleteFile = async (context: AppContextValue, {
  fileName, bucketName,
}: {
  fileName: string, bucketName: string,
}) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .remove([fileName]);
  if (error) {
    throw error;
  }
  return data;
};
