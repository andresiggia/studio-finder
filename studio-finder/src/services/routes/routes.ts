// pages
import Home from '../../pages/Home/Home';
import About from '../../pages/About/About';
import Login from '../../pages/Login/Login';
import StudioLogin from '../../pages/StudioLogin/StudioLogin';
import Account from '../../pages/Account/Account';
import StudioAccount from '../../pages/StudioAccount/StudioAccount';

// services
import i18n from '../i18n/i18n';

export enum RouteNames {
  home = 'home',
  about = 'about',
  login = 'login',
  account = 'account',
  studioLogin = 'studioLogin',
  studioAccount = 'studioAccount',
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

export enum LoginRouteNames {
  login = 'login',
  signUp = 'signUp',
}

const loginRoutes = [
  {
    name: LoginRouteNames.login,
    path: LoginRouteNames.login,
    getLabel: () => i18n.t('Log In'),
  },
  {
    name: LoginRouteNames.signUp,
    path: LoginRouteNames.signUp,
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
    name: RouteNames.login,
    path: '/login',
    exact: false,
    strict: false,
    isDefault: false,
    Component: Login,
    getLabel: () => i18n.t('Login'),
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
  {
    name: RouteNames.studioAccount,
    path: '/studio-account',
    exact: false,
    strict: false,
    isDefault: false,
    Component: StudioAccount,
    getLabel: () => i18n.t('Studio Account'),
  },
];

export default routes;

export const getRoutesByName = (names: string[], customRoutes?: Route[]) => (customRoutes || routes)
  .filter((item) => names.includes(item.name));

export const defaultRoute = routes.find((route) => route.isDefault);
