// context
import { AppContextValue } from '../../context/AppContext';

import { toCamelCase } from './helpers';
import { TableName } from './tables';

export interface Setting {
  key: string,
  value: any,
}

export const getSettings = async (context: AppContextValue) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.settings)
    .select();
  if (error) {
    throw error;
  }
  let settings: Setting[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    settings = data.map((item: any) => {
      // eslint-disable-next-line no-console
      console.info('setting', item);
      return {
        key: toCamelCase(item.key),
        value: item.value?.value || null,
      };
    });
  }
  return settings;
};
