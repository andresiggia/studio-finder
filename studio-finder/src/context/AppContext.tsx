/* eslint-disable react/no-unused-state */
import React from 'react';
import supabase, { createClient } from '@supabase/supabase-js';

// constants
import appKeys from '../constants/supabase-keys';

// services
import { i18nInit } from '../services/i18n/i18n';
import { getRoutesByName, RouteName, LoginRouteName } from '../services/routes/routes';
import { getRoles, Role } from '../services/api/roles';
import {
  UserType, UserProfile, getUserProfile, setUserProfile,
} from '../services/api/users';
import { getSettings, Setting } from '../services/api/settings';

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
  accessToken: string,
  profile: UserProfile | null,
  roles: Role[] | null,
  settings: Setting[] | null,
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
      user: null,
      accessToken: '',
      profile: null,
      roles: null,
      settings: null,
    };

    i18nInit();
  }

  componentDidMount() {
    this.mounted = true;
    this.authResponse = this.supabase.auth.onAuthStateChange((event, session) => {
      // eslint-disable-next-line no-console
      console.log('user updated', session);
      this.updateSession(session);
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

  loadRoles = async () => {
    try {
      const roles = await getRoles(this.getContext());
      // eslint-disable-next-line no-console
      console.log('got roles', roles);
      return new Promise((resolve) => {
        this.setMountedState({
          roles,
        }, () => resolve(true));
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('error - loadRoles', error);
      return Promise.reject(error);
    }
  }

  loadSettings = async () => {
    try {
      const settings = await getSettings(this.getContext());
      // eslint-disable-next-line no-console
      console.log('got settings', settings);
      return new Promise((resolve) => {
        this.setMountedState({
          settings,
        }, () => resolve(true));
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('error - loadSettings', error);
      return Promise.reject(error);
    }
  }

  loadUserProfile = async () => {
    try {
      const { user } = this.state;
      if (!user) {
        // eslint-disable-next-line no-console
        console.warn('user not available, cannot load profile', user);
        return false;
      }
      // eslint-disable-next-line no-console
      console.log('loading user profile...');
      const profile = await getUserProfile(this.getContext());
      // eslint-disable-next-line no-console
      console.log('got user profile', profile);
      return new Promise((resolve) => {
        this.setMountedState({
          profile: profile || null,
        }, () => resolve(profile));
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('error - loadUserProfile', error);
      return Promise.reject(error);
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

  updateSession = async (session: supabase.Session | null) => {
    const { user: currentUser, profile } = this.state;
    if (session?.user !== currentUser) {
      this.setMountedState({
        user: session?.user || null,
        accessToken: session?.access_token || '',
      }, async () => {
        if (profile?.id !== session?.user?.id) {
          await this.loadUserProfile();
        }
      });
    }
  }

  getLoginPath = (options: {
    parentRoute: string, backUrl?: string, redirectTo?: string, screen?: string,
  }) => {
    const {
      parentRoute, backUrl = '', redirectTo = '', screen = LoginRouteName.login,
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

  getDefaultLoggedInRouteName = (userType = UserType.musician) => {
    switch (userType) {
      case UserType.studio:
        return RouteName.studioAccount;
      case UserType.musician:
      default:
        return RouteName.account;
    }
  }

  getDefaultLoggedInRoutePath = (userType: UserType) => {
    const routeName = this.getDefaultLoggedInRouteName(userType);
    const [route] = getRoutesByName([routeName]);
    return route?.path || '';
  }

  getContext = () => ({
    state: this.state,
    supabase: this.supabase,
    loadRoles: this.loadRoles,
    loadSettings: this.loadSettings,
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
