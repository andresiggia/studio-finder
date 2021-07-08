// pages
import Home from '../../pages/Home/Home';
import About from '../../pages/About/About';
import LoginSignUp from '../../pages/LoginSignUp/LoginSignUp';
import StudioLogin from '../../pages/StudioLogin/StudioLogin';
import Account from '../../pages/Account/Account';

// services
import i18n from '../i18n/i18n';

export enum RouteNames {
  home = 'home',
  about = 'about',
  studioLogin = 'studioLogin',
  loginSignUp = 'loginSignUp',
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
  },
  {
    name: RouteNames.loginSignUp,
    path: '/login',
    exact: false,
    strict: false,
    isDefault: false,
    Component: LoginSignUp,
    routes: [
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
    ],
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
