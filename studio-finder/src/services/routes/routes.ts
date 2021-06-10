// pages
import Home from '../../pages/Home/Home';
import About from '../../pages/About/About';
import Login from '../../pages/Login/Login';

// services
import i18n from '../i18n/i18n';

const routes: {
  name: string, path: string, exact: boolean, strict: boolean, isDefault: boolean, Component?: any,
  getLabel: () => string,
}[] = [
  {
    name: 'home',
    path: '/home',
    exact: true,
    strict: false,
    isDefault: true,
    Component: Home,
    getLabel: () => i18n.t('Home'),
  },
  {
    name: 'about',
    path: '/about',
    exact: true,
    strict: false,
    isDefault: false,
    Component: About,
    getLabel: () => i18n.t('About'),
  },
  {
    name: 'studioLogin',
    path: '/studio-login',
    exact: false,
    strict: false,
    isDefault: false,
    // Component: StudioLogin,
    getLabel: () => i18n.t('Studio Login'),
  },
  {
    name: 'signUp',
    path: '/signup',
    exact: false,
    strict: false,
    isDefault: false,
    // Component: SignUp,
    getLabel: () => i18n.t('Sign Up'),
  },
  {
    name: 'login',
    path: '/login',
    exact: false,
    strict: false,
    isDefault: false,
    Component: Login,
    getLabel: () => i18n.t('Log In'),
  },
];

export default routes;

export const getRoutesByName = (names: string[]) => routes.filter((item) => names.includes(item.name));

export const defaultRoute = routes.find((route) => route.isDefault);
