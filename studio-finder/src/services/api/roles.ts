import { AppContextValue } from '../../context/AppContext';

import { TableName } from './tables';

export enum RoleError {
  noDefaultStudioRole = 'noDefaultStudioRole',
}

export enum PermissionType {
  read = 'read',
  list = 'list',
  insert = 'insert',
  update = 'update',
  delete = 'delete',
}

export interface Permission {
  entity: string,
  name: PermissionType | null,
  value: boolean,
}

export interface Role {
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
  name: '',
  title: '',
  permissions: null,
};

export const getDefaultStudioRoleName = (context: AppContextValue) => {
  const { state } = context;
  const setting = state.settings?.find((item) => item.key === 'defaultStudioRoleName');
  if (!setting || !setting.value) {
    throw RoleError.noDefaultStudioRole;
  }
  return setting.value;
};

export const getRoles = async (context: AppContextValue) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.studioRoles)
    .select();
  if (error) {
    throw error;
  }
  let roles: any[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    roles = data.map((role: any) => {
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
  return {
    studioRoles: roles,
    userRoles: [],
    spaceRoles: [],
  };
};
