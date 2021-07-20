import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase } from './helpers';
import { TableNames } from './tables';

export enum StudioErrors {
  missingUserId = 'missingUserId',
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
}

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
};

export const getStudios = async (context: AppContextValue) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw StudioErrors.missingUserId;
  }
  const { data, error } = await supabase
    .from(TableNames.studioUsers)
    .select('studio_id, user_id, studios(studio_id: id)')
    .match({
      user_id: userId,
    });
  if (error) {
    throw error;
  }
  let studios: StudioProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studios = data.map((studioData: any) => updateObjectKeysToCamelCase(studioData));
  }
  return studios;
};

export const getStudio = async (context: AppContextValue, studioId: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableNames.studios)
    .select()
    .match({
      id: String(studioId),
    });
  if (error) {
    throw error;
  }
  let studio = null;
  if (data && Array.isArray(data) && data.length > 0) {
    const [studioData] = data;
    if (studioData?.id === studioId) {
      studio = updateObjectKeysToCamelCase(studioData);
    }
  }
  return studio;
};
