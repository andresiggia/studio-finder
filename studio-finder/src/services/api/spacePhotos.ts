import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { Photo } from './photos';
import { TableName } from './tables';

export enum SpacePhotoError {
  notLoggedIn = 'notLoggedIn',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
}

export interface SpacePhoto extends Photo {
  spaceId: number,
}
export const defaultSpacePhoto: SpacePhoto = {
  id: 0,
  spaceId: 0,
  photoUrl: '',
  order: 0,
};
export const spacePhotoRequiredFields: (keyof SpacePhoto)[] = ['spaceId', 'photoUrl', 'order'];

export const getSpacePhotos = async (context: AppContextValue, props: {
  spaceId?: number, start?: number, limit?: number,
}) => {
  const {
    spaceId, start = 0, limit = 100,
  } = props;
  if (!spaceId) {
    throw SpacePhotoError.missingSpaceId;
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.spacePhotos)
    .select()
    .eq('space_id', spaceId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let spacePhotos: SpacePhoto[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    spacePhotos = data.map((item: any) => updateObjectKeysToCamelCase(item));
  }
  return spacePhotos;
};

export const upsertSpacePhoto = async (context: AppContextValue, spacePhoto: SpacePhoto) => {
  const { supabase } = context;
  const isEditing = !!spacePhoto.id;
  const itemObj: any = { ...spacePhoto };
  if (!isEditing) { // inserting new row
    delete itemObj.id; // id should be created by back-end
  }
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
  const { data, error } = await supabase
    .from(TableName.spacePhotos)
    .upsert([itemData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw SpacePhotoError.invalidResponse;
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new space photo', newRow);
  return newRow;
};

export const deleteSpacePhoto = async (context: AppContextValue, id: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.spacePhotos)
    .delete()
    .match({ id });
  if (error) {
    throw error;
  }
  if (!data) {
    throw SpacePhotoError.invalidResponse;
  }
  return data;
};
