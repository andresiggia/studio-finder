import { AppContextValue } from '../../context/AppContext';

import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { getDefaultStudioRoleName, Role, RoleTable } from './roles';
import { TableName } from './tables';
import { ViewName } from './views';

export enum StudioError {
  notLoggedIn = 'notLoggedIn',
  invalidResponse = 'invalidResponse',
  missingStudioRoles = 'missingStudioRoles',
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
  modifiedAt: Date | null,
}

const studioDateFields: (keyof StudioProfile)[] = ['createdAt', 'modifiedAt'];
export const studioRequiredFields: (keyof StudioProfile)[] = ['title'];

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
  modifiedAt: null,
};

export const getStudios = async (context: AppContextValue, props?: {
  start?: number, limit?: number, inactive?: boolean,
}) => {
  const { start = 0, limit = 100, inactive = false } = props || {};
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw StudioError.notLoggedIn;
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
      return convertDateFields(studio, studioDateFields);
    });
  }
  return studios;
};

export const getStudio = async (context: AppContextValue, studioId: number) => {
  const { supabase } = context;
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
    studio = convertDateFields(updateObjectKeysToCamelCase(data), studioDateFields);
  }
  return studio;
};

export const upsertStudio = async (context: AppContextValue, studioProfile: StudioProfile) => {
  const { supabase, state } = context;
  const { roles } = state;
  const defaultStudioRoleName = getDefaultStudioRoleName(context);
  if (!roles || !roles.some((item: Role) => item.tableName === RoleTable.studioRoles && item.name === defaultStudioRoleName)) {
    throw StudioError.missingStudioRoles;
  }
  const userId = state.user?.id;
  if (!userId) {
    throw StudioError.notLoggedIn;
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
    throw StudioError.invalidResponse;
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new studio info', newRow, data);
  if (!isEditing) { // create studioUser foreign key for new items
    const studioId = newRow.id;
    const studioUser: StudioUser = {
      userId,
      studioId,
      studioRoleName: defaultStudioRoleName,
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
  return data;
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
    throw StudioError.invalidResponse;
  }
  return data;
};
