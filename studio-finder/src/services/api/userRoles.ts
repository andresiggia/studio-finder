// context
import { AppContextValue } from '../../context/AppContext';
import { convertFromAPI, convertToAPI } from './helpers';

import { RoleType } from './roles';
import { TableName } from './tables';
import { ViewName } from './views';

export enum UserRoleError {
  missingTypeId = 'missingTypeId',
  missingRoleType = 'missingRoleType',
  invalidResponse = 'invalidResponse',
}

export interface UserRole {
  userId: string,
  roleName: string,
}

export const defaultUserRole: UserRole = {
  userId: '',
  roleName: '',
};

export interface UserRoleDisplay extends UserRole {
  name: string,
  surname: string,
  photoUrl: string,
  email: string,
}

export const defaultUserRoleDisplay: UserRoleDisplay = {
  ...defaultUserRole,
  name: '',
  surname: '',
  photoUrl: '',
  email: '',
};

export const userRoleRequiredFields: (keyof UserRole)[] = ['userId', 'roleName'];

export const userRoleDisplayRequiredFields: (keyof UserRoleDisplay)[] = ['userId', 'roleName', 'email'];

export const getUserRoles = async (context: AppContextValue, props: {
  typeId: number, roleType: RoleType, start?: number, limit?: number,
}) => {
  const {
    typeId, roleType, start = 0, limit = 1000,
  } = props;
  if (!typeId) {
    throw new Error(UserRoleError.missingTypeId);
  }
  if (!roleType) {
    throw new Error(UserRoleError.missingRoleType);
  }
  const { supabase } = context;
  const fieldName = roleType === RoleType.studio
    ? 'studio_id'
    : 'space_id';
  const { data, error } = await supabase
    .from(roleType === RoleType.studio
      ? ViewName.studioUsersList
      : ViewName.spaceUsersList)
    .select()
    .eq(fieldName, typeId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let items: UserRoleDisplay[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    items = data.map((userRole: any) => {
      const item = { ...userRole };
      delete item[fieldName]; // remove studio/space field
      return convertFromAPI(item);
    });
  }
  return items;
};

export const setUserRole = async (context: AppContextValue, {
  userRole, typeId, roleType,
}: {
  userRole: UserRole, typeId: number, roleType: RoleType,
}) => {
  if (!typeId) {
    throw new Error(UserRoleError.missingTypeId);
  }
  if (!roleType) {
    throw new Error(UserRoleError.missingRoleType);
  }
  const { supabase } = context;
  const itemObj: any = {
    ...userRole,
    [roleType === RoleType.studio
      ? 'studioId'
      : 'spaceId']: typeId,
  };
  const itemData = convertToAPI(itemObj);
  const { data, error } = await supabase
    .from(roleType === RoleType.studio
      ? TableName.studioUsers
      : TableName.spaceUsers)
    .upsert([itemData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(UserRoleError.invalidResponse);
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new/updated user role', newRow);
  return newRow;
};

export const deleteUserRole = async (context: AppContextValue, {
  userRole, typeId, roleType,
}: {
  userRole: UserRole, typeId: number, roleType: RoleType,
}) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(roleType === RoleType.studio
      ? TableName.studioUsers
      : TableName.spaceUsers)
    .delete()
    .match({
      [roleType === RoleType.studio
        ? 'studio_id'
        : 'space_id']: typeId,
      user_id: userRole.userId,
    });
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(UserRoleError.invalidResponse);
  }
  return data;
};
