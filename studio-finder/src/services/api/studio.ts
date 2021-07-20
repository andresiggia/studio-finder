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
  const { supabase } = context;
  // const id = state.user?.id;
  // if (!id) {
  //   throw StudioErrors.missingUserId;
  // }
  const { data, error } = await supabase
    .from(TableNames.users)
    .select();
  if (error) {
    throw error;
  }
  let studios: StudioProfile[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studios = data.map((studio: any) => updateObjectKeysToCamelCase(studio));
  }
  return studios;
};
