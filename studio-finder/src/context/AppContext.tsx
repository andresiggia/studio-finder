/* eslint-disable react/no-unused-state */
import React from 'react';
import supabase, { createClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';
import { USER_TYPES } from '../constants/user-types';
import { TABLE_NAMES, UserProfile } from '../constants/tables';

// services
import { i18nInit } from '../services/i18n/i18n';
import { getRoutesByName, RouteNames, LoginRouteNames } from '../services/routes/routes';
import { updateObjectKeysToCamelCase } from '../services/api/api';

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
  profile: UserProfile | null,
}

export class AppContextProvider extends React.Component<Props, State> {
  mounted = false

  supabase = createClient(appKeys.url, appKeys.publicAnonKey);

  authResponse: AuthResponse | null = null

  constructor(props: never) {
    super(props);

    this.state = {
      user: this.supabase.auth.user(),
      profile: null,
    };

    i18nInit();
  }

  componentDidMount() {
    this.mounted = true;
    this.authResponse = this.supabase.auth.onAuthStateChange((event, session) => {
      // eslint-disable-next-line no-console
      console.log('user updated', session);
      this.updateUser(session?.user);
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.authResponse?.data) {
      this.authResponse.data.unsubscribe();
    }
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else if (typeof callback === 'function') {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      callback();
    }
  }

  loadUserProfile = async () => {
    try {
      const { user } = this.state;
      if (!user) {
        // eslint-disable-next-line no-console
        console.log('loading user profile...');
        return Promise.resolve({ data: null });
      }
      // eslint-disable-next-line no-console
      console.log('loading user profile...');
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.users)
        .select()
        .match({
          id: user.id,
        });
      if (error) {
        throw error;
      }
      let profileData: any;
      if (data && Array.isArray(data) && data.length > 0) {
        [profileData] = data;
      }
      const profile: any = updateObjectKeysToCamelCase(profileData);
      // eslint-disable-next-line no-console
      console.log('got user profile', profile);
      return new Promise((resolve) => {
        this.setMountedState({
          profile: profile || null,
        }, () => resolve({ data: profile }));
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('error - loadUserProfile', error);
      return Promise.resolve({ error });
    }
  }

  updateUser = (user?: supabase.User | null) => new Promise((resolve) => {
    const { user: currentUser } = this.state;
    if (user === currentUser) {
      resolve(true);
    } else {
      this.setMountedState({
        user: user || null,
        profile: null, // reset user profile when auth user changes
      }, async () => {
        await this.loadUserProfile();
        resolve(true);
      });
    }
  })

  getLoginPath = (options: {
    parentRoute: string, backUrl?: string, redirectTo?: string, screen?: string,
  }) => {
    const {
      parentRoute, backUrl = '', redirectTo = '', screen = LoginRouteNames.login,
    } = options;
    const params = [
      ['backUrl', backUrl],
      ['redirectTo', redirectTo],
      ['screen', screen],
    ].filter((item) => !!item[0] && !!item[1])
      .map((item) => item.join('='));
    const [url] = getRoutesByName([parentRoute]).map((route) => `${route.path}?${params.join('&')}`);
    return url;
  }

  getDefaultLoggedInRouteName = (userType = USER_TYPES.musician) => {
    switch (userType) {
      case USER_TYPES.studio:
        return RouteNames.studioAccount;
      case USER_TYPES.musician:
      default:
        return RouteNames.account;
    }
  }

  getDefaultLoggedInRoutePath = (userType: string) => {
    const routeName = this.getDefaultLoggedInRouteName(userType);
    const [route] = getRoutesByName([routeName]);
    return route?.path || '';
  }

  render() {
    const { children } = this.props;
    return (
      <AppContext.Provider
        value={{
          state: this.state,
          supabase: this.supabase,
          updateUser: this.updateUser,
          getLoginPath: this.getLoginPath,
          getDefaultLoggedInRouteName: this.getDefaultLoggedInRouteName,
          getDefaultLoggedInRoutePath: this.getDefaultLoggedInRoutePath,
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }
}
