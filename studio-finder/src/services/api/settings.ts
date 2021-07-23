// context
import { AppContextValue } from '../../context/AppContext';

import { updateObjectKeysToCamelCase } from './helpers';
import { TableNames } from './tables';

export interface Setting {
  key: string,
  value: any,
}

export const getSettings = async (context: AppContextValue) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableNames.settings)
    .select();
  if (error) {
    throw error;
  }
  let settings: Setting[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    settings = data.map((item: any) => {
      // eslint-disable-next-line no-console
      console.info('setting', item);
      return updateObjectKeysToCamelCase({
        ...item,
        value: item.value?.value || null,
      });
    });
  }
  return settings;
};
