import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { TableNames } from './tables';

export enum UserErrors {
  missingUserId = 'missingUserId',
}

export enum UserTypes {
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
    throw UserErrors.missingUserId;
  }
  const { data, error } = await supabase
    .from(TableNames.users)
    .select()
    .match({
      id,
    });
  if (error) {
    throw error;
  }
  let profile: any = null;
  if (data && Array.isArray(data) && data.length > 0) {
    const [profileData] = data;
    if (profileData?.id === id) {
      profile = updateObjectKeysToCamelCase(profileData);
      if (profile) {
        // convert date fields
        dateFields.forEach((fieldName: string) => {
          const value = profile[fieldName as keyof UserProfile];
          profile[fieldName as keyof UserProfile] = value
            ? new Date(value)
            : null;
        });
      }
    }
  }
  return profile;
};

export const setUserProfile = async (context: AppContextValue, userProfile: UserProfile) => {
  const { supabase, state } = context;
  const id = state.user?.id;
  if (!id) {
    throw UserErrors.missingUserId;
  }
  const profile: any = {
    ...userProfile,
    id, // inject user id
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!profile.createdAt) { // createdAt should be created by back-end if not set
    delete profile.createdAt;
  }
  const userProfileData = updateObjectKeysToUnderscoreCase(profile);
  const { data, error } = await supabase
    .from(TableNames.users)
    .upsert([userProfileData]);
  if (error) {
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
