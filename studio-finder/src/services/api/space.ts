import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { getDefaultSpaceRoleName, Role } from './roles';
import { TableName } from './tables';

export enum SpaceError {
  missingUserId = 'missingUserId',
  invalidResponse = 'invalidResponse',
  missingSpaceRoles = 'missingSpaceRoles',
}

export interface SpaceProfile {
  id: number,
  studioId: number,
  title: string,
  description: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}

const dateFields = ['createdAt', 'modifiedAt'];

export interface SpaceUser {
  spaceId: number,
  userId: string,
  spaceRoleName: string,
}

export const defaultSpaceProfile: SpaceProfile = {
  id: 0,
  studioId: 0,
  title: '',
  description: '',
  createdAt: null,
  modifiedAt: null,
};

export const getSpaces = async (context: AppContextValue, props?: {
  studioId: number, start?: number, limit: number
}) => {
  const { start = 0, limit = 100 } = props || {};
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw SpaceError.missingUserId;
  }
  const { data, error } = await supabase
    .from(TableName.spaceUsers)
    .select(`${TableName.spaces}(*)`)
    .eq('user_id', userId)
    // .order('title', { foreignTable: 'spaces', ascending: true }) // ordering by column in foreign table not working
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let spaces: SpaceProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    spaces = data.map((spaceUserData: any) => updateObjectKeysToCamelCase(spaceUserData[TableName.spaces]));
  }
  return spaces;
};

export const getSpace = async (context: AppContextValue, spaceId: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.spaces)
    .select()
    .eq('id', spaceId)
    .single();
  if (error) {
    throw error;
  }
  let space: any = null;
  if (data && data.id === spaceId) {
    space = updateObjectKeysToCamelCase(data);
    // convert date fields
    dateFields.forEach((fieldName: string) => {
      const value = space[fieldName as keyof SpaceProfile];
      space[fieldName as keyof SpaceProfile] = value
        ? new Date(value)
        : null;
    });
  }
  return space;
};

export const upsertSpace = async (context: AppContextValue, spaceProfile: SpaceProfile) => {
  const { supabase, state } = context;
  const { spaceRoles } = state;
  const defaultSpaceRoleName = getDefaultSpaceRoleName(context);
  if (!spaceRoles || !spaceRoles.some((item: Role) => item.name === defaultSpaceRoleName)) {
    throw SpaceError.missingSpaceRoles;
  }
  const userId = state.user?.id;
  if (!userId) {
    throw SpaceError.missingUserId;
  }
  const isEditing = !!spaceProfile.id;
  const profile: any = {
    ...spaceProfile,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) {
    delete profile.createdAt; // createdAt should be created by back-end
    delete profile.id; // id should be created by back-end
  }
  const spaceProfileData = updateObjectKeysToUnderscoreCase(profile);
  const { data, error } = await supabase
    .from(TableName.spaces)
    .upsert([spaceProfileData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw SpaceError.invalidResponse;
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new space info', newRow, data);
  return data;
};
