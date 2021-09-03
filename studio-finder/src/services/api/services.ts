// context
import { AppContextValue } from '../../context/AppContext';

import { TableName } from './tables';

export interface Service {
  type: string,
  title: string,
}

export const getServices = async (context: AppContextValue) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.services)
    .select();
  if (error) {
    throw error;
  }
  return (data || []) as Service[];
};
