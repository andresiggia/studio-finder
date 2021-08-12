import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { Photo } from './photos';
import {
  deleteFile, getFileUrl, StorageBucket, uploadFile,
} from './storage';
import { TableName } from './tables';

export enum StudioPhotoError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  invalidResponse = 'invalidResponse',
}

export interface StudioPhoto extends Photo {
  studioId: number,
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
    throw new Error(StudioPhotoError.missingStudioId);
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

export const upsertStudioPhoto = async (context: AppContextValue, {
  studioPhoto, studioId, file,
}: {
  studioPhoto: StudioPhoto, studioId: number, file?: File | null
}) => {
  const { supabase } = context;
  const isEditing = !!studioPhoto.id;
  const itemObj: any = { ...studioPhoto };
  if (!isEditing) { // inserting new row
    if (!studioId) {
      throw new Error(StudioPhotoError.missingStudioId);
    }
    itemObj.studioId = studioId; // injecting studio id provided
    delete itemObj.id; // id should be created by back-end
  }
  const filePath = `${itemObj.studioId}/${file?.name || ''}`;
  if (file) {
    // eslint-disable-next-line no-console
    console.log('will upload file', file, 'to', filePath);
    const { data: fileUploaded, error: fileUploadError } = await uploadFile(context, {
      filePath, fileBody: file, bucketName: StorageBucket.studios,
    });
    if (fileUploadError) {
      throw fileUploadError;
    }
    // eslint-disable-next-line no-console
    console.log('file uploaded', fileUploaded);
    const { publicURL: photoUrl = '', error: urlError } = getFileUrl(context, {
      filePath, bucketName: StorageBucket.studios,
    });
    if (urlError) {
      throw urlError;
    }
    itemObj.photoUrl = photoUrl;
  }
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
  const { data, error } = await supabase
    .from(TableName.studioPhotos)
    .upsert([itemData]);
  if (error) {
    if (file) {
      // revert operation if update failed
      // eslint-disable-next-line no-console
      console.log('will delete file', file, 'from', filePath);
      const { data: fileDeleted, error: fileDeleteError } = await deleteFile(context, {
        filePath, bucketName: StorageBucket.studios,
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
    throw new Error(StudioPhotoError.invalidResponse);
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
    throw new Error(StudioPhotoError.invalidResponse);
  }
  return data;
};
