// context
import { AppContextValue } from '../../context/AppContext';

import { toCamelCase } from './helpers';
import { TableName } from './tables';

export enum SettingKey {
  defaultStudioRoleName = 'defaultStudioRoleName',
  defaultSpaceRoleName = 'defaultSpaceRoleName',
}

export interface Setting {
  key: SettingKey,
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
    settings = data.map((item: any) => ({
      key: toCamelCase(item.key) as SettingKey,
      value: item.value?.value || null,
    }));
  }
  return settings;
};
