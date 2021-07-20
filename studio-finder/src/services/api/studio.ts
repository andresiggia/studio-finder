import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { TableNames } from './tables';

export enum StudioErrors {
  missingUserId = 'missingUserId',
  invalidResponse = 'invalidResponse',
}

export interface StudioProfile {
  id: number,
  title: string,
  description: string,
  address1: string,
  address2: string,
  address3: string,
  postCode: string,
  city: string,
  region: string,
  country: string,
  createdAt: Date | null,
}

export interface StudioUser {
  studioId: number,
  userId: string,
  studioRoleName: string,
}

export const defaultStudioProfile: StudioProfile = {
  id: 0,
  title: '',
  description: '',
  address1: '',
  address2: '',
  address3: '',
  postCode: '',
  city: '',
  region: '',
  country: '',
  createdAt: null,
};

export const getStudios = async (context: AppContextValue) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw StudioErrors.missingUserId;
  }
  const { data, error } = await supabase
    .from(TableNames.studioUsers)
    .select('studio_id, user_id, studios(studio_id: id)')
    .match({
      user_id: userId,
    });
  if (error) {
    throw error;
  }
  let studios: StudioProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studios = data.map((studioData: any) => updateObjectKeysToCamelCase(studioData));
  }
  return studios;
};

export const getStudio = async (context: AppContextValue, studioId: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableNames.studios)
    .select()
    .match({
      id: String(studioId),
    });
  if (error) {
    throw error;
  }
  let studio = null;
  if (data && Array.isArray(data) && data.length > 0) {
    const [studioData] = data;
    if (studioData?.id === studioId) {
      studio = updateObjectKeysToCamelCase(studioData);
    }
  }
  return studio;
};

export const insertStudio = async (context: AppContextValue, studioProfile: StudioProfile) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw StudioErrors.missingUserId;
  }
  const profile: any = {
    ...studioProfile,
    // modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!profile.createdAt) { // createdAt should be created by back-end if not set
    delete profile.createdAt;
  }
  const studioProfileData = updateObjectKeysToUnderscoreCase(profile);
  const { data, error } = await supabase
    .from(TableNames.studios)
    .insert([studioProfileData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw StudioErrors.invalidResponse;
  }
  const [newItem] = data;
  // create studio_users foreign key
  const studioUser: StudioUser = {
    userId,
    studioId: newItem?.id,
    studioRoleName: '', // to do
  };
  const studioUserData = updateObjectKeysToUnderscoreCase(studioUser);
  const { data: joinData, error: joinError } = await supabase
    .from(TableNames.studioUsers)
    .insert([studioUserData]);
  if (joinError) {
    throw joinError;
  }
  return data;
};
