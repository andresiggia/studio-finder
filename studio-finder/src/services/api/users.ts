import { AppContextValue } from '../../context/AppContext';

import { convertFromAPI, convertToAPI } from './helpers';
import {
  deleteFile, StorageBucket, uploadFile, getFileUrl,
} from './storage';
import { TableName } from './tables';
import { ViewName } from './views';

export enum UserError {
  notLoggedIn = 'notLoggedIn',
}

export enum UserType {
  studio = 'studio',
  musician = 'musician',
}

export interface UserProfile {
  id: string,
  name: string,
  surname: string,
  birthday: Date | null,
  photoUrl: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}

const userDateFields = ['birthday', 'createdAt', 'modifiedAt'];

export const defaultUserProfile: UserProfile = {
  id: '',
  name: '',
  surname: '',
  birthday: null,
  photoUrl: '',
  createdAt: null,
  modifiedAt: null,
};

export interface UserDisplay extends UserProfile {
  email: string,
}

export const getUserProfile = async (context: AppContextValue) => {
  const { supabase, state } = context;
  const id = state.user?.id;
  if (!id) {
    throw new Error(UserError.notLoggedIn);
  }
  // eslint-disable-next-line no-console
  console.log('loading user profile for id', id);
  const { data, error } = await supabase
    .from(TableName.users)
    .select()
    .eq('id', id);
  if (error) {
    throw error;
  }
  let profile: UserProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    [profile] = data.map((item: any) => convertFromAPI(item, userDateFields));
  }
  return profile;
};

export const setUserProfile = async (context: AppContextValue, {
  userProfile, file,
}: {
  userProfile: UserProfile, file?: File,
}) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(UserError.notLoggedIn);
  }
  const itemObj: any = {
    ...userProfile,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!itemObj.id) { // new row
    itemObj.id = userId; // inject userId
    delete itemObj.createdAt; // createdAt should be created by back-end if not set
  }
  const filePath = `${userId}/${file?.name || ''}`;
  if (file) {
    // eslint-disable-next-line no-console
    console.log('will upload file', file, 'to', filePath);
    const { data: fileUploaded, error: fileUploadError } = await uploadFile(context, {
      filePath, fileBody: file, bucketName: StorageBucket.users,
    });
    if (fileUploadError) {
      throw fileUploadError;
    }
    // eslint-disable-next-line no-console
    console.log('file uploaded', fileUploaded);
    const { publicURL: photoUrl = '', error: urlError } = getFileUrl(context, {
      filePath, bucketName: StorageBucket.users,
    });
    if (urlError) {
      throw urlError;
    }
    itemObj.photoUrl = photoUrl;
  }
  const itemData = convertToAPI(itemObj, userDateFields);
  const { data, error } = await supabase
    .from(TableName.users)
    .upsert(itemData);
  if (error) {
    if (file) {
      // revert operation if update failed
      // eslint-disable-next-line no-console
      console.log('will delete file', file, 'from', filePath);
      const { data: fileDeleted, error: fileDeleteError } = await deleteFile(context, {
        filePath, bucketName: StorageBucket.users,
      });
      if (fileDeleteError) {
        // eslint-disable-next-line no-console
        console.warn('error when deleting file (optional)', fileDeleteError);
      } else {
        // eslint-disable-next-line no-console
        console.log('file deleted', fileDeleted);
      }
    }
    throw error;
  }
  return data;
};

export const updateUserType = async (context: AppContextValue, userType: string) => {
  const { supabase } = context;
  const { user, error } = await supabase.auth.update({
    data: {
      type: userType,
    },
  });
  if (error) {
    throw error;
  }
  return user;
};

export const searchUsersByEmail = async (context: AppContextValue, props: {
  query: string, type: UserType, start?: number, limit?: number,
}) => {
  const {
    query, type, start = 0, limit = 1000,
  } = props;
  const { supabase } = context;
  const { data, error } = await supabase
    .from(ViewName.usersList)
    .select()
    .like('email', `%${query.toLowerCase().trim().split(' ').join('%')}%`)
    .eq('type', type)
    .range(start, start + limit - 1);
  // eslint-disable-next-line no-console
  console.log('data', data);
  if (error) {
    throw error;
  }
  let items: UserDisplay[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    items = data.map(({ type: unusedType, ...item }: any) => convertFromAPI(item));
  }
  return items;
};
