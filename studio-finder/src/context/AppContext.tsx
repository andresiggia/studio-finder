/* eslint-disable react/no-unused-state */
import React from 'react';
import supabase, { createClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';

// services
import { i18nInit } from '../services/i18n/i18n';

const AppContext = React.createContext({});

export default AppContext;

interface Props {
  children?: any | any[],
}

interface AuthResponse {
  data: supabase.Subscription | null,
  error: Error | null,
}

export class AppContextProvider extends React.Component<Props> {
  supabase = createClient(appKeys.url, appKeys.publicAnonKey);

  authResponse: AuthResponse;

  constructor(props: never) {
    super(props);

    // user
    this.state = {
      user: this.supabase.auth.user(),
    };
    this.authResponse = this.supabase.auth.onAuthStateChange((event, session) => {
      this.setState({
        user: session?.user || null,
      });
    });

    // i18n
    i18nInit();
  }

  componentWillUnmount() {
    if (this.authResponse?.data) {
      this.authResponse.data.unsubscribe();
    }
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
