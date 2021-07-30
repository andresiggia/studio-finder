import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { getDefaultSpaceRoleName, Role, RoleTable } from './roles';
import { StudioProfile } from './studios';
import { TableName } from './tables';

export enum SpaceError {
  missingUserId = 'missingUserId',
  invalidResponse = 'invalidResponse',
  missingSpaceRoles = 'missingSpaceRoles',
  editingSpaceOfWrongStudio = 'editingSpaceOfWrongStudio',
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

export const upsertSpace = async (context: AppContextValue, {
  spaceProfile, studioProfile,
}: {
  spaceProfile: SpaceProfile, studioProfile: StudioProfile,
}) => {
  const { supabase, state } = context;
  const { roles } = state;
  const defaultSpaceRoleName = getDefaultSpaceRoleName(context);
  if (!roles || !roles.some((item: Role) => item.tableName === RoleTable.spaceRoles && item.name === defaultSpaceRoleName)) {
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
  if (!isEditing) { // inserting new row
    profile.studioId = studioProfile.id; // injecting studio id provided
    delete profile.createdAt; // createdAt should be created by back-end
    delete profile.id; // id should be created by back-end
  } else if (profile.studioId !== studioProfile.id) { // only when editing
    // studio id must match studioProfile provided
    throw new Error(SpaceError.editingSpaceOfWrongStudio);
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
  if (!isEditing) { // create spaceUser foreign key for new items
    const spaceId = newRow.id;
    const spaceUser: SpaceUser = {
      userId,
      spaceId,
      spaceRoleName: defaultSpaceRoleName,
    };
    const spaceUserData = updateObjectKeysToUnderscoreCase(spaceUser);
    // eslint-disable-next-line no-console
    console.log('will add new space user', spaceUserData);
    const { data: newJoinRow, error: joinError } = await supabase
      .from(TableName.spaceUsers)
      .insert([spaceUserData]);
    if (joinError) {
      // eslint-disable-next-line no-console
      console.warn('error during join creation', joinError);
      // roll back space creation
      const { data: deletedRow, error: deleteError } = await supabase
        .from(TableName.spaces)
        .delete()
        .eq('id', spaceId);
      if (deleteError) {
        // eslint-disable-next-line no-console
        console.warn('error during space creation rollback', deleteError);
        throw deleteError;
      }
      // eslint-disable-next-line no-console
      console.log('rolled back space creation', deletedRow);
      throw joinError;
    }
    // eslint-disable-next-line no-console
    console.log('added join', newJoinRow);
  }
  return data;
};
