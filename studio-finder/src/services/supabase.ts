import { createClient, SupabaseClient } from '@supabase/supabase-js';
import appKeys from '../constants/supabase-keys';

class Supabase {
  app: SupabaseClient
  
  constructor() {
    // Create a single supabase client for interacting with your database 
    this.app = createClient(appKeys.url, appKeys.publicAnonKey);
  }
}

export default Supabase;