import { AppContextValue } from '../../context/AppContext';

import { convertDateFieldsFromAPI, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import {
  deleteFile, StorageBucket, uploadFile, getFileUrl,
} from './storage';
import { TableName } from './tables';

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
  postCode: string,
  city: string,
  region: string,
  country: string,
  photoUrl: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}

const dateFields = ['birthday', 'createdAt', 'modifiedAt'];

export const defaultUserProfile: UserProfile = {
  id: '',
  name: '',
  surname: '',
  birthday: null,
  postCode: '',
  city: '',
  region: '',
  country: '',
  photoUrl: '',
  createdAt: null,
  modifiedAt: null,
};

export const getUserProfile = async (context: AppContextValue) => {
  const { supabase, state } = context;
  const id = state.user?.id;
  if (!id) {
    throw new Error(UserError.notLoggedIn);
  }
  const { data, error } = await supabase
    .from(TableName.users)
    .select()
    .eq('id', id)
    .single();
  if (error) {
    throw error;
  }
  let profile: any = null;
  if (data && data.id === id) {
    profile = convertDateFieldsFromAPI(updateObjectKeysToCamelCase(data), dateFields);
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
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
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
