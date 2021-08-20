import { AppContextValue } from '../../context/AppContext';

import { convertFromAPI, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { getDefaultStudioRoleName, Role, RoleType } from './roles';
import { TableName } from './tables';
import { ViewName } from './views';
import { DBFunction } from './functions';
import { Address, defaultAddress } from './address';

export enum StudioError {
  notLoggedIn = 'notLoggedIn',
  invalidResponse = 'invalidResponse',
  missingStudioId = 'missingStudioId',
  missingStudioRoles = 'missingStudioRoles',
}

export interface StudioProfile extends Address {
  id: number,
  title: string,
  description: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}

const studioDateFields: (keyof StudioProfile)[] = ['createdAt', 'modifiedAt'];
export const studioRequiredFields: (keyof StudioProfile)[] = ['title', 'address'];

export interface StudioUser {
  studioId: number,
  userId: string,
  roleName: string,
}

export const defaultStudioProfile: StudioProfile = {
  ...defaultAddress,
  id: 0,
  title: '',
  description: '',
  createdAt: null,
  modifiedAt: null,
};

export interface StudioProfileDisplay extends StudioProfile {
  photoUrl: string,
  distance: number,
}

export const defaultStudioProfileDisplay: StudioProfileDisplay = {
  ...defaultStudioProfile,
  photoUrl: '',
  distance: 0,
};

export const getStudios = async (context: AppContextValue, props?: {
  start?: number, limit?: number, lat?: number, lon?: number,
}) => {
  const {
    start = 0, limit = 1000, lat, lon,
  } = props || {};
  const { supabase } = context;
  let data;
  if (lat && lon) {
    // order by distance to provided latitude/longitude
    const { data: dataDistance, error } = await supabase
      .rpc(DBFunction.getStudiosWithDistance, {
        lat, lon,
      })
      .eq('inactive', false)
      .order('distance', { ascending: true, nullsFirst: false })
      .range(start, start + limit - 1);
    if (error) {
      throw error;
    }
    data = dataDistance;
  } else {
    // order by latest additions
    const { data: dataList, error } = await supabase
      .from(ViewName.studiosList)
      .select()
      .eq('inactive', false)
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);
    if (error) {
      throw error;
    }
    data = dataList;
  }
  let studios: StudioProfileDisplay[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studios = data.map((studioData: any) => {
      const studio = updateObjectKeysToCamelCase(studioData);
      return convertFromAPI(studio, studioDateFields);
    });
  }
  return studios;
};

export const getStudiosByUser = async (context: AppContextValue, props?: {
  start?: number, limit?: number, inactive?: boolean,
}) => {
  const { start = 0, limit = 1000, inactive = false } = props || {};
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(StudioError.notLoggedIn);
  }
  const { data, error } = await supabase
    .from(ViewName.studiosWithUserId)
    .select()
    .eq('user_id', userId)
    .eq('inactive', inactive)
    .order('title', { ascending: true })
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let studios: StudioProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studios = data.map((studioDataWithUserId: any) => {
      // extract userId from studioDataWithUserId before saving
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _userId, ...studio } = updateObjectKeysToCamelCase(studioDataWithUserId);
      return convertFromAPI(studio, studioDateFields);
    });
  }
  return studios;
};

export const getStudio = async (context: AppContextValue, studioId: number) => {
  const { supabase } = context;
  if (!studioId) {
    throw new Error(StudioError.missingStudioId);
  }
  const { data, error } = await supabase
    .from(TableName.studios)
    .select()
    .eq('id', studioId)
    .single();
  if (error) {
    throw error;
  }
  let studio: any = null;
  if (data && data.id === studioId) {
    studio = convertFromAPI(data, studioDateFields);
  }
  return studio;
};

export const setStudio = async (context: AppContextValue, studioProfile: StudioProfile) => {
  const { supabase, state } = context;
  const { roles } = state;
  const defaultStudioRoleName = getDefaultStudioRoleName(context);
  if (!roles || !roles.some((item: Role) => item.type === RoleType.studio && item.name === defaultStudioRoleName)) {
    throw new Error(StudioError.missingStudioRoles);
  }
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(StudioError.notLoggedIn);
  }
  const isEditing = !!studioProfile.id;
  const profile: any = {
    ...studioProfile,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) {
    delete profile.createdAt; // createdAt should be created by back-end
    delete profile.id; // id should be created by back-end
  }
  const studioProfileData = updateObjectKeysToUnderscoreCase(profile);
  const { data, error } = await supabase
    .from(TableName.studios)
    .upsert([studioProfileData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(StudioError.invalidResponse);
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new studio info', newRow, data);
  if (!isEditing) { // create studioUser foreign key for new items
    const studioId = newRow.id;
    const studioUser: StudioUser = {
      userId,
      studioId,
      roleName: defaultStudioRoleName,
    };
    const studioUserData = updateObjectKeysToUnderscoreCase(studioUser);
    // eslint-disable-next-line no-console
    console.log('will add new studio user', studioUserData);
    const { data: newJoinRow, error: joinError } = await supabase
      .from(TableName.studioUsers)
      .insert([studioUserData]);
    if (joinError) {
      // eslint-disable-next-line no-console
      console.warn('error during join creation', joinError);
      // roll back studio creation
      const { data: deletedRow, error: deleteError } = await supabase
        .from(TableName.studios)
        .delete()
        .eq('id', studioId);
      if (deleteError) {
        // eslint-disable-next-line no-console
        console.warn('error during studio creation rollback', deleteError);
        throw deleteError;
      }
      // eslint-disable-next-line no-console
      console.log('rolled back studio creation', deletedRow);
      throw joinError;
    }
    // eslint-disable-next-line no-console
    console.log('added join', newJoinRow);
  }
  return newRow;
};

export const deleteStudio = async (context: AppContextValue, id: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.studios)
    .update({ inactive: true })
    .match({ id });
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(StudioError.invalidResponse);
  }
  return data;
};
