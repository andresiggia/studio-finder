import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { TableName } from './tables';

export enum StudioPhotoError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  invalidResponse = 'invalidResponse',
}

export interface StudioPhoto {
  id: number,
  studioId: number,
  photoUrl: string,
  order: number,
}
export const defaultStudioPhoto: StudioPhoto = {
  id: 0,
  studioId: 0,
  photoUrl: '',
  order: 0,
};
export const studioPhotoRequiredFields: (keyof StudioPhoto)[] = ['studioId', 'photoUrl', 'order'];

export const getStudioPhotos = async (context: AppContextValue, props: {
  studioId?: number, start?: number, limit?: number,
}) => {
  const {
    studioId, start = 0, limit = 100,
  } = props;
  if (!studioId) {
    throw StudioPhotoError.missingStudioId;
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.studioPhotos)
    .select()
    .eq('studio_id', studioId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let studioPhotos: StudioPhoto[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    studioPhotos = data.map((item: any) => updateObjectKeysToCamelCase(item));
  }
  return studioPhotos;
};

export const upsertStudioPhoto = async (context: AppContextValue, studioPhoto: StudioPhoto) => {
  const { supabase } = context;
  const isEditing = !!studioPhoto.id;
  const itemObj: any = { ...studioPhoto };
  if (!isEditing) { // inserting new row
    delete itemObj.id; // id should be created by back-end
  }
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
  const { data, error } = await supabase
    .from(TableName.studioPhotos)
    .upsert([itemData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw StudioPhotoError.invalidResponse;
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new studio photo', newRow);
  return newRow;
};

export const deleteStudioPhoto = async (context: AppContextValue, id: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.studioPhotos)
    .delete()
    .match({ id });
  if (error) {
    throw error;
  }
  if (!data) {
    throw StudioPhotoError.invalidResponse;
  }
  return data;
};
