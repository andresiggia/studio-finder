import { AppContextValue } from '../../context/AppContext';

import { convertFromAPI } from './helpers';
import { SettingKey } from './settings';
import { TableName } from './tables';
import { ViewName } from './views';

export enum RoleError {
  noDefaultStudioRole = 'noDefaultStudioRole',
  noDefaultSpaceRole = 'noDefaultSpaceRole',
}

export enum RoleType {
  space = 'space',
  studio = 'studio',
}

export interface Permission {
  id: number,
  entity: TableName | null,
  read: boolean,
  insert: boolean,
  update: boolean,
  delete: boolean,
}

export const defaultPermission: Permission = {
  id: 0,
  entity: null,
  read: false,
  insert: false,
  update: false,
  delete: false,
};

export interface Role {
  name: string,
  title: string,
  type: RoleType | null,
  permissions: Permission[],
}

export const defaultRole: Role = {
  name: '',
  title: '',
  type: null,
  permissions: [],
};

export interface PermissionWithRole extends Permission {
  roleName: string,
  roleTitle: string,
  roleType: string,
}

export const getDefaultStudioRoleName = (context: AppContextValue) => {
  const { state } = context;
  const setting = state.settings?.find((item) => item.key === SettingKey.defaultStudioRoleName);
  if (!setting || !setting.value) {
    throw new Error(RoleError.noDefaultStudioRole);
  }
  return setting.value;
};

export const getDefaultSpaceRoleName = (context: AppContextValue) => {
  const { state } = context;
  const setting = state.settings?.find((item) => item.key === SettingKey.defaultSpaceRoleName);
  if (!setting || !setting.value) {
    throw new Error(RoleError.noDefaultSpaceRole);
  }
  return setting.value;
};

export const getRoles = async (context: AppContextValue) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(ViewName.permissionsWithRole)
    .select();
  if (error) {
    throw error;
  }
  const roles: Role[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    data.map((item: any) => convertFromAPI(item))
      .forEach((permissionWithRole) => {
        const {
          roleName, roleTitle, roleType, ...permission
        } = permissionWithRole;
        const index = roles.findIndex((role) => role.name === roleName);
        if (index === -1) { // new role
          roles.push({
            name: roleName,
            title: roleTitle,
            type: roleType as RoleType || null,
            permissions: [permission],
          });
        } else { // existing role
          roles[index].permissions.push(permission);
        }
      });
  }
  return roles;
};
