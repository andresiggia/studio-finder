import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { getDefaultStudioRoleName, Role } from './roles';
import { TableName } from './tables';

export enum StudioError {
  missingUserId = 'missingUserId',
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

const dateFields = ['createdAt', 'modifiedAt'];

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
  start?: number, limit: number
}) => {
  const { start = 0, limit = 100 } = props || {};
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw StudioError.missingUserId;
  }
  const { data, error } = await supabase
    .from(TableName.studioUsers)
    .select(`${TableName.studios}(*)`)
    .eq('user_id', userId)
    // .order('title', { foreignTable: 'studios', ascending: true }) // ordering by column in foreign table not working
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let studios: StudioProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studios = data.map((studioUserData: any) => updateObjectKeysToCamelCase(studioUserData[TableName.studios]));
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
    studio = updateObjectKeysToCamelCase(data);
    // convert date fields
    dateFields.forEach((fieldName: string) => {
      const value = studio[fieldName as keyof StudioProfile];
      studio[fieldName as keyof StudioProfile] = value
        ? new Date(value)
        : null;
    });
  }
  return studio;
};

export const upsertStudio = async (context: AppContextValue, studioProfile: StudioProfile) => {
  const { supabase, state } = context;
  const { studioRoles } = state;
  const defaultStudioRoleName = getDefaultStudioRoleName(context);
  if (!studioRoles || !studioRoles.some((item: Role) => item.name === defaultStudioRoleName)) {
    throw StudioError.missingStudioRoles;
  }
  const userId = state.user?.id;
  if (!userId) {
    throw StudioError.missingUserId;
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
