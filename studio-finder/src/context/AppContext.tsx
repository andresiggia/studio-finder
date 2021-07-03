/* eslint-disable react/no-unused-state */
import React from 'react';
import { createClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';

// services
import { i18nInit } from '../services/i18n/i18n';

const AppContext = React.createContext({});

export default AppContext;

interface Props {
  children?: any | any[],
}

export class AppContextProvider extends React.Component<Props> {
  supabase = createClient(appKeys.url, appKeys.publicAnonKey);

  constructor(props: never) {
    super(props);

    // user
    this.state = {
      user: this.supabase.auth.user(),
    };
    this.supabase.auth.onAuthStateChange((event, session) => {
      // eslint-disable-next-line no-console
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
      <AppContext.Provider
        value={{
          state: this.state,
          auth: this.supabase.auth,
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }
}
