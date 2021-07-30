import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase } from './helpers';
import { SettingKey } from './settings';
import { ViewName } from './views';

export enum RoleError {
  noDefaultStudioRole = 'noDefaultStudioRole',
  noDefaultSpaceRole = 'noDefaultSpaceRole',
}

export enum PermissionType {
  read = 'read',
  list = 'list',
  insert = 'insert',
  update = 'update',
  delete = 'delete',
}

export enum RoleTable {
  userRoles = 'user_roles',
  studioRoles = 'studio_roles',
  spaceRoles = 'space_roles',
}

export interface Permission {
  entity: string,
  name: PermissionType | null,
  value: boolean,
}

export interface Role {
  tableName: RoleTable | null,
  name: string,
  title: string,
  permissions: Permission[] | null,
}

export const defaultPermission: Permission = {
  entity: '',
  name: null,
  value: false,
};

export const defaultRole: Role = {
  tableName: null,
  name: '',
  title: '',
  permissions: null,
};

export const getDefaultStudioRoleName = (context: AppContextValue) => {
  const { state } = context;
  const setting = state.settings?.find((item) => item.key === SettingKey.defaultStudioRoleName);
  if (!setting || !setting.value) {
    throw RoleError.noDefaultStudioRole;
  }
  return setting.value;
};

export const getDefaultSpaceRoleName = (context: AppContextValue) => {
  const { state } = context;
  const setting = state.settings?.find((item) => item.key === SettingKey.defaultSpaceRoleName);
  if (!setting || !setting.value) {
    throw RoleError.noDefaultSpaceRole;
  }
  return setting.value;
};

export const getRoles = async (context: AppContextValue) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(ViewName.roles)
    .select();
  if (error) {
    throw error;
  }
  let roles: any[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    roles = data.map((roleItem: any) => {
      const role = updateObjectKeysToCamelCase(roleItem);
      const permissionsArr: Permission[] = [];
      Object.keys(role.permissions).forEach((entity) => {
        Object.values(PermissionType).forEach((type) => {
          permissionsArr.push({
            entity,
            name: type,
            value: role.permissions[entity][type] || false,
          });
        });
      });
      return {
        ...role,
        permissions: permissionsArr,
      };
    });
  }
  return roles;
};
