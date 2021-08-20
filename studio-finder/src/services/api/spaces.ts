import { AppContextValue } from '../../context/AppContext';

import { convertFromAPI, updateObjectKeysToUnderscoreCase } from './helpers';
import { getDefaultSpaceRoleName, Role, RoleType } from './roles';
import { TableName } from './tables';
import { ViewName } from './views';

export enum SpaceError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingSpaceRoles = 'missingSpaceRoles',
  editingSpaceOfWrongStudio = 'editingSpaceOfWrongStudio',
}

export interface SpaceProfile {
  id: number,
  studioId: number,
  title: string,
  description: string,
  inactive: boolean,
  createdAt: Date | null,
  modifiedAt: Date | null,
}

const spaceDateFields: (keyof SpaceProfile)[] = ['createdAt', 'modifiedAt'];
export const spaceRequiredFields: (keyof SpaceProfile)[] = ['title'];

export interface SpaceUser {
  spaceId: number,
  userId: string,
  roleName: string,
}

export const defaultSpaceProfile: SpaceProfile = {
  id: 0,
  studioId: 0,
  title: '',
  description: '',
  inactive: false,
  createdAt: null,
  modifiedAt: null,
};

export interface SpaceProfileDisplay extends SpaceProfile {
  photoUrl: string,
}

export const defaultSpaceProfileDisplay: SpaceProfileDisplay = {
  ...defaultSpaceProfile,
  photoUrl: '',
};

export const getSpaces = async (context: AppContextValue, props: {
  studioId: number, start?: number, limit?: number,
}) => {
  const {
    studioId, start = 0, limit = 1000,
  } = props || {};
  if (!studioId) {
    throw new Error(SpaceError.missingStudioId);
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(ViewName.spacesList)
    .select()
    .eq('studio_id', studioId)
    .eq('inactive', false)
    .order('title', { ascending: true })
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let spaces: SpaceProfileDisplay[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    spaces = data.map((spaceDataWithUserId: any) => {
      // extract userId from spaceDataWithUserId before saving
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _userId, ...spaceData } = convertFromAPI(spaceDataWithUserId, spaceDateFields);
      return spaceData;
    });
  }
  return spaces;
};

export const getSpacesByUser = async (context: AppContextValue, props: {
  studioId: number, start?: number, limit?: number, inactive?: boolean,
}) => {
  const {
    studioId, start = 0, limit = 1000, inactive = false,
  } = props || {};
  if (!studioId) {
    throw new Error(SpaceError.missingStudioId);
  }
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(SpaceError.notLoggedIn);
  }
  const { data, error } = await supabase
    .from(ViewName.spacesWithUserId)
    .select()
    .eq('studio_id', studioId)
    .eq('user_id', userId)
    .eq('inactive', inactive)
    .order('title', { ascending: true })
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let spaces: SpaceProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    spaces = data.map((spaceDataWithUserId: any) => {
      // extract userId from spaceDataWithUserId before saving
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _userId, ...spaceData } = convertFromAPI(spaceDataWithUserId, spaceDateFields);
      return spaceData;
    });
  }
  return spaces;
};

export const getSpace = async (context: AppContextValue, spaceId: number) => {
  const { supabase } = context;
  if (!spaceId) {
    throw new Error(SpaceError.missingSpaceId);
  }
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
    space = convertFromAPI(data, spaceDateFields);
  }
  return space;
};

export const setSpace = async (context: AppContextValue, {
  spaceProfile, studioId,
}: {
  spaceProfile: SpaceProfile, studioId: number,
}) => {
  const { supabase, state } = context;
  const { roles } = state;
  const defaultSpaceRoleName = getDefaultSpaceRoleName(context);
  if (!roles || !roles.some((item: Role) => item.type === RoleType.space && item.name === defaultSpaceRoleName)) {
    throw new Error(SpaceError.missingSpaceRoles);
  }
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(SpaceError.notLoggedIn);
  }
  const isEditing = !!spaceProfile.id;
  const profile: any = {
    ...spaceProfile,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) { // inserting new row
    if (!studioId) {
      throw new Error(SpaceError.missingStudioId);
    }
    profile.studioId = studioId; // injecting studio id provided
    delete profile.createdAt; // createdAt should be created by back-end
    delete profile.id; // id should be created by back-end
  } else if (profile.studioId !== studioId) { // only when editing
    // studioId must match value provided
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
    throw new Error(SpaceError.invalidResponse);
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new space info', newRow, data);
  if (!isEditing) { // create spaceUser foreign key for new items
    const spaceId = newRow.id;
    const spaceUser: SpaceUser = {
      userId,
      spaceId,
      roleName: defaultSpaceRoleName,
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
  return newRow;
};
