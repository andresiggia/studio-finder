import { AppContextValue } from '../../context/AppContext';

import { convertFromAPI, updateObjectKeysToUnderscoreCase } from './helpers';
import { Photo } from './photos';
import {
  deleteFile, getFileUrl, StorageBucket, uploadFile,
} from './storage';
import { TableName } from './tables';

export enum SpacePhotoError {
  notLoggedIn = 'notLoggedIn',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  editingPhotoOfWrongSpace = 'editingPhotoOfWrongSpace',
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
export const spacePhotoRequiredFields: (keyof SpacePhoto)[] = ['photoUrl'];

export const getSpacePhotos = async (context: AppContextValue, props: {
  spaceId?: number, start?: number, limit?: number,
}) => {
  const {
    spaceId, start = 0, limit = 1000,
  } = props;
  if (!spaceId) {
    throw new Error(SpacePhotoError.missingSpaceId);
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.spacePhotos)
    .select()
    .eq('space_id', spaceId)
    .order('order', { ascending: true })
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let spacePhotos: SpacePhoto[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    spacePhotos = data.map((item: any) => convertFromAPI(item));
  }
  return spacePhotos;
};

export const setSpacePhoto = async (context: AppContextValue, {
  spacePhoto, spaceId, file,
}: {
    spacePhoto: SpacePhoto, spaceId: number, file?: File | null
}) => {
  const { supabase } = context;
  const isEditing = !!spacePhoto.id;
  const itemObj: any = { ...spacePhoto };
  if (!isEditing) { // inserting new row
    if (!spaceId) {
      throw new Error(SpacePhotoError.missingSpaceId);
    }
    itemObj.spaceId = spaceId; // injecting space id provided
    delete itemObj.id; // id should be created by back-end
  } else if (itemObj.spaceId === spaceId) {
    throw new Error(SpacePhotoError.editingPhotoOfWrongSpace);
  }
  const filePath = `${itemObj.spaceId}/${file?.name || ''}`;
  if (file) {
    // eslint-disable-next-line no-console
    console.log('will upload file', file, 'to', filePath);
    const { data: fileUploaded, error: fileUploadError } = await uploadFile(context, {
      filePath, fileBody: file, bucketName: StorageBucket.spaces,
    });
    if (fileUploadError) {
      throw fileUploadError;
    }
    // eslint-disable-next-line no-console
    console.log('file uploaded', fileUploaded);
    const { publicURL: photoUrl = '', error: urlError } = getFileUrl(context, {
      filePath, bucketName: StorageBucket.spaces,
    });
    if (urlError) {
      throw urlError;
    }
    itemObj.photoUrl = photoUrl;
  }
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
  const { data, error } = await supabase
    .from(TableName.spacePhotos)
    .upsert([itemData]);
  if (error) {
    if (file) {
      // revert operation if update failed
      // eslint-disable-next-line no-console
      console.log('will delete file', file, 'from', filePath);
      const { data: fileDeleted, error: fileDeleteError } = await deleteFile(context, {
        filePath, bucketName: StorageBucket.spaces,
      });
      if (fileDeleteError) {
        // eslint-disable-next-line no-console
        console.warn('error when deleting file (optional)', fileDeleteError);
      } else {
        // eslint-disable-next-line no-console
        console.log('file deleted', fileDeleted);
      }
    }
    throw error;
  }
  if (!data) {
    throw new Error(SpacePhotoError.invalidResponse);
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
    throw new Error(SpacePhotoError.invalidResponse);
  }
  return data;
};
