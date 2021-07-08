/* eslint-disable react/no-unused-state */
import React from 'react';
import supabase, { createClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';

// services
import { i18nInit } from '../services/i18n/i18n';
import { getRoutesByName, RouteNames } from '../services/routes/routes';

const AppContext = React.createContext({});

export default AppContext;

interface Props {
  children?: any | any[],
}

interface AuthResponse {
  data: supabase.Subscription | null,
  error: Error | null,
}

interface State {
  user: supabase.User | null,
}

export class AppContextProvider extends React.Component<Props, State> {
  supabase = createClient(appKeys.url, appKeys.publicAnonKey);

  authResponse: AuthResponse | null = null

  constructor(props: never) {
    super(props);

    this.state = {
      user: this.supabase.auth.user(),
    };

    i18nInit();
  }

  componentDidMount() {
    this.authResponse = this.supabase.auth.onAuthStateChange((event, session) => {
      this.updateUser(session?.user);
    });
  }

  componentWillUnmount() {
    if (this.authResponse?.data) {
      this.authResponse.data.unsubscribe();
    }
  }

  updateUser = async (user?: supabase.User | null) => new Promise((resolve) => {
    this.setState({
      user: user || null,
    }, () => resolve(true));
  })

  getLoginUrl = (options: {
    backUrl?: string, redirectTo?: string, screen?: string,
  }) => {
    const {
      backUrl = '', redirectTo = '', screen = RouteNames.login,
    } = options;
    const params = [
      ['backUrl', backUrl],
      ['redirectTo', redirectTo],
      ['screen', screen],
    ].filter((item) => !!item[0] && !!item[1])
      .map((item) => item.join('='));
    const [url] = getRoutesByName([RouteNames.loginSignUp]).map((route) => `${route.path}?${params.join('&')}`);
    return url;
  }

  render() {
    const { children } = this.props;
    return (
      <AppContext.Provider
        value={{
          state: this.state,
          auth: this.supabase.auth,
          updateUser: this.updateUser,
          getLoginUrl: this.getLoginUrl,
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }
}
