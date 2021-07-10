// pages
import Home from '../../pages/Home/Home';
import About from '../../pages/About/About';
import MusicianLogin from '../../pages/MusicianLogin/MusicianLogin';
import StudioLogin from '../../pages/StudioLogin/StudioLogin';
import Account from '../../pages/Account/Account';

// services
import i18n from '../i18n/i18n';

export enum RouteNames {
  home = 'home',
  about = 'about',
  studioLogin = 'studioLogin',
  musicianLogin = 'musicianLogin',
  login = 'login',
  signUp = 'signUp',
  account = 'account',
}

export interface Route {
  name: string;
  path: string;
  exact?: boolean;
  strict?: boolean;
  isDefault?: boolean;
  Component?: any;
  routes?: Route[],
  getLabel?: () => string;
}

const loginRoutes = [
  {
    name: RouteNames.login,
    path: RouteNames.login,
    getLabel: () => i18n.t('Log In'),
  },
  {
    name: RouteNames.signUp,
    path: RouteNames.signUp,
    getLabel: () => i18n.t('Sign Up'),
  },
];

const routes: Route[] = [
  {
    name: RouteNames.home,
    path: '/home',
    exact: true,
    strict: false,
    isDefault: true,
    Component: Home,
    getLabel: () => i18n.t('Home'),
  },
  {
    name: RouteNames.about,
    path: '/about',
    exact: true,
    strict: false,
    isDefault: false,
    Component: About,
    getLabel: () => i18n.t('About'),
  },
  {
    name: RouteNames.studioLogin,
    path: '/studio-login',
    exact: false,
    strict: false,
    isDefault: false,
    Component: StudioLogin,
    getLabel: () => i18n.t('Studio Login'),
    routes: loginRoutes,
  },
  {
    name: RouteNames.musicianLogin,
    path: '/login',
    exact: false,
    strict: false,
    isDefault: false,
    Component: MusicianLogin,
    routes: loginRoutes,
  },
  {
    name: RouteNames.account,
    path: '/account',
    exact: false,
    strict: false,
    isDefault: false,
    Component: Account,
    getLabel: () => i18n.t('My Account'),
  },
];

export default routes;

export const getRoutesByName = (names: string[]) => routes.filter((item) => names.includes(item.name));

export const defaultRoute = routes.find((route) => route.isDefault);
