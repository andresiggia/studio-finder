/* eslint-disable react/no-unused-state */
import React from 'react';
import supabase, { createClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';
import {
  UserTypes, UserProfile, getUserProfile, setUserProfile,
} from '../services/api/user';

// services
import { i18nInit } from '../services/i18n/i18n';
import { getRoutesByName, RouteNames, LoginRouteNames } from '../services/routes/routes';

const AppContext = React.createContext({});

export default AppContext;

interface Props {
  children?: any | any[],
}

interface AuthResponse {
  data: supabase.Subscription | null,
  error: Error | null,
}

export interface State {
  user: supabase.User | null,
  profile: UserProfile | null,
}

export interface AppContextValue {
  state: State,
  supabase: supabase.SupabaseClient,
  updateProfile: any,
  getLoginPath: any,
  getDefaultLoggedInRouteName: any,
  getDefaultLoggedInRoutePath: any,
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
      this.updateUserState(session?.user);
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
    } else {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  loadUserProfile = async () => {
    try {
      const { user } = this.state;
      if (!user) {
        return Promise.resolve({ data: null });
      }
      // eslint-disable-next-line no-console
      console.log('loading user profile...');
      const profile = await getUserProfile(this.getContext());
      if (profile) {
        const dateFields = ['birthday', 'createdAt', 'modifiedAt'];
        dateFields.forEach((fieldName: string) => {
          const value = profile[fieldName as keyof UserProfile];
          profile[fieldName as keyof UserProfile] = value
            ? new Date(value)
            : null;
        });
      }
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

  updateProfile = async (profile: UserProfile) => {
    try {
      // eslint-disable-next-line no-console
      console.log('will update user profile', profile);
      const response = await setUserProfile(this.getContext(), profile);
      // eslint-disable-next-line no-console
      console.log('user profile updated', response);
      await this.loadUserProfile();
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  updateUserState = async (user?: supabase.User | null) => {
    const { user: currentUser } = this.state;
    if (user === currentUser) {
      return Promise.resolve(true);
    }
    await this.loadUserProfile();
    return new Promise((resolve) => {
      this.setMountedState({
        user: user || null,
      }, () => resolve(true));
    });
  }

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

  getDefaultLoggedInRouteName = (userType = UserTypes.musician) => {
    switch (userType) {
      case UserTypes.studio:
        return RouteNames.studioAccount;
      case UserTypes.musician:
      default:
        return RouteNames.account;
    }
  }

  getDefaultLoggedInRoutePath = (userType: UserTypes) => {
    const routeName = this.getDefaultLoggedInRouteName(userType);
    const [route] = getRoutesByName([routeName]);
    return route?.path || '';
  }

  getContext = () => ({
    state: this.state,
    supabase: this.supabase,
    updateProfile: this.updateProfile,
    getLoginPath: this.getLoginPath,
    getDefaultLoggedInRouteName: this.getDefaultLoggedInRouteName,
    getDefaultLoggedInRoutePath: this.getDefaultLoggedInRoutePath,
  })

  // render

  render() {
    const { children } = this.props;
    return (
      <AppContext.Provider
        value={this.getContext()}
      >
        {children}
      </AppContext.Provider>
    );
  }
}
