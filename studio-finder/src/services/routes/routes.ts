// pages
import Home from '../../pages/Home/Home';
import About from '../../pages/About/About';
import Login from '../../pages/Login/Login';
import StudioLogin from '../../pages/StudioLogin/StudioLogin';
import Account from '../../pages/Account/Account';
import StudioAccount from '../../pages/StudioAccount/StudioAccount';
import ForgotPassword from '../../pages/ForgotPassword/ForgotPassword';

// services
import i18n from '../i18n/i18n';

export enum RouteName {
  home = 'home',
  about = 'about',
  login = 'login',
  account = 'account',
  studioLogin = 'studioLogin',
  studioAccount = 'studioAccount',
  forgotPassword = 'forgotPassword',
}

export interface Route {
  name: string;
  path: string;
  otherPaths?: string[];
  exact?: boolean;
  strict?: boolean;
  Component?: any;
  routes?: Route[],
  getLabel?: () => string;
}

export enum LoginRouteName {
  login = 'login',
  signUp = 'signUp',
}

const loginRoutes = [
  {
    name: LoginRouteName.login,
    path: LoginRouteName.login,
    getLabel: () => i18n.t('Log In'),
  },
  {
    name: LoginRouteName.signUp,
    path: LoginRouteName.signUp,
    getLabel: () => i18n.t('Sign Up'),
  },
];

const routes: Route[] = [
  {
    name: RouteName.home,
    path: '/home',
    exact: true,
    strict: false,
    Component: Home,
    getLabel: () => i18n.t('Home'),
  },
  {
    name: RouteName.about,
    path: '/about',
    exact: true,
    strict: false,
    Component: About,
    getLabel: () => i18n.t('About'),
  },
  {
    name: RouteName.forgotPassword,
    path: '/forgot-password',
    exact: false,
    strict: false,
    Component: ForgotPassword,
    getLabel: () => i18n.t('Redefine password'),
  },
  {
    name: RouteName.studioLogin,
    path: '/studio-login',
    exact: false,
    strict: false,
    Component: StudioLogin,
    getLabel: () => i18n.t('Studio Login'),
    routes: loginRoutes,
  },
  {
    name: RouteName.login,
    path: '/login',
    exact: false,
    strict: false,
    Component: Login,
    getLabel: () => i18n.t('Login'),
    routes: loginRoutes,
  },
  {
    name: RouteName.account,
    path: '/account',
    exact: false,
    strict: false,
    Component: Account,
    getLabel: () => i18n.t('My Account'),
  },
  {
    name: RouteName.studioAccount,
    path: '/studio-account',
    exact: false,
    strict: false,
    Component: StudioAccount,
    getLabel: () => i18n.t('Studio Account'),
  },
];

export default routes;

export const getRoutesByName = (names: string[], customRoutes?: Route[]) => (customRoutes || routes)
  .filter((item) => names.includes(item.name));

const defaultRouteName = RouteName.home;

export const defaultRoute = routes.find((route) => route.name === defaultRouteName);
