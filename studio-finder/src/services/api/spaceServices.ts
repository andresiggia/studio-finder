import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { TableName } from './tables';

export enum SpaceServiceError {
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
}

export interface SpaceService {
  spaceId: number,
  serviceType: string,
  title: string,
  price: number,
}
export const defaultSpaceService: SpaceService = {
  spaceId: 0,
  serviceType: '',
  title: '',
  price: 0,
};
export const spaceServiceRequiredFields: (keyof SpaceService)[] = ['serviceType', 'title'];

export const getSpaceServices = async (context: AppContextValue, props: {
  spaceId?: number, start?: number, limit?: number,
}) => {
  const {
    spaceId, start = 0, limit = 1000,
  } = props;
  if (!spaceId) {
    throw new Error(SpaceServiceError.missingSpaceId);
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.spaceServices)
    .select()
    .eq('space_id', spaceId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let spaceServices: SpaceService[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    spaceServices = data.map((item: any) => updateObjectKeysToCamelCase(item));
  }
  return spaceServices;
};

export const setSpaceService = async (context: AppContextValue, {
  spaceService, spaceId,
}: {
  spaceService: SpaceService, spaceId: number,
}) => {
  if (!spaceId) {
    throw new Error(SpaceServiceError.missingSpaceId);
  }
  const { supabase } = context;
  const itemObj: any = {
    ...spaceService,
    spaceId,
  };
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
  const { data, error } = await supabase
    .from(TableName.spaceServices)
    .upsert([itemData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(SpaceServiceError.invalidResponse);
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new space service', newRow);
  return newRow;
};

export const deleteSpaceService = async (context: AppContextValue, spaceService: SpaceService) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.spaceServices)
    .delete()
    .match({
      title: spaceService.title,
      spaceId: spaceService.spaceId,
    });
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(SpaceServiceError.invalidResponse);
  }
  return data;
};
