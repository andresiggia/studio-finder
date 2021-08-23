// context
import { AppContextValue } from '../../context/AppContext';
import { convertFromAPI } from './helpers';

import { RoleType } from './roles';
import { ViewName } from './views';
// import { TableName } from './tables';

export interface UserRole {
  userId: string,
  roleName: string,
}

export interface UserRoleDisplay extends UserRole {
  name: string,
  surname: string,
  photoUrl: string,
  email: string,
}

export const userRoleRequiredFields: (keyof UserRole)[] = ['userId', 'roleName'];

export const userRoleDisplayRequiredFields: (keyof UserRoleDisplay)[] = ['userId', 'roleName', 'email'];

export interface StudioUserRole extends UserRole {
  studioId: number,
}

export interface StudioUserRoleDisplay extends UserRoleDisplay {
  studioId: number,
}

export const defaultStudioRole: StudioUserRole = {
  userId: '',
  roleName: '',
  studioId: 0,
};

export const defaultStudioRoleDisplay: StudioUserRoleDisplay = {
  ...defaultStudioRole,
  name: '',
  surname: '',
  photoUrl: '',
  email: '',
};

export interface SpaceUserRole extends UserRole {
  spaceId: number,
}

export interface SpaceUserRoleDisplay extends UserRoleDisplay {
  spaceId: number,
}

export const defaultSpaceRole: SpaceUserRole = {
  userId: '',
  roleName: '',
  spaceId: 0,
};

export const defaultSpaceRoleDisplay: SpaceUserRoleDisplay = {
  ...defaultSpaceRole,
  name: '',
  surname: '',
  photoUrl: '',
  email: '',
};

export const getUserRoles = async (context: AppContextValue, props: {
  typeId: number, roleType: RoleType, start?: number, limit?: number,
}) => {
  const {
    typeId, roleType, start = 0, limit = 1000,
  } = props;
  const { supabase } = context;
  const { data, error } = await supabase
    .from(roleType === RoleType.studio
      ? ViewName.studioUsersList
      : ViewName.spaceUsersList)
    .select()
    .eq(roleType === RoleType.studio
      ? 'studio_id'
      : 'space_id', typeId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let items: (StudioUserRoleDisplay | SpaceUserRoleDisplay)[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    items = data.map((userRole: any) => convertFromAPI(userRole));
  }
  return items;
};
