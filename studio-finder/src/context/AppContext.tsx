import React from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';

// services
import { i18nInit } from '../services/i18n/i18n';

const AppContext = React.createContext({});

export default AppContext;

interface Props {
  children: object | object[],
};

export class AppContextProvider extends React.Component<Props> {

  supabase: SupabaseClient;

  constructor(props: any) {
    super(props);

    // user
    this.supabase = createClient(appKeys.url, appKeys.publicAnonKey);
    this.state = {
      user: this.supabase.auth.user(),
    }
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('onAuthStateChange', { event, session });
      this.setState({
        user: session?.user || null,
      });
    });

    // i18n
    i18nInit();
  }

  render() {
    const { children } = this.props;
    return (
      <AppContext.Provider value={{
        state: this.state,
      }}>
        {children}
      </AppContext.Provider>
    );
  }
}
