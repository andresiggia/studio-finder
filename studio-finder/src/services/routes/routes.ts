import Home from '../../pages/Home/Home';
import Login from '../../pages/Login/Login';

const routes: {
  path: string, exact: boolean, isDefault: boolean, Component?: any,
}[] = [
  {
    path: '/home',
    exact: true,
    isDefault: true,
    Component: Home,
  },
  {
    path: '/about',
    exact: true,
    isDefault: false,
    // Component: About,
  },
  {
    path: '/studio-login',
    exact: false,
    isDefault: false,
    // Component: StudioLogin,
  },
  {
    path: '/signup',
    exact: false,
    isDefault: false,
    // Component: SignUp,
  },
  {
    path: '/login',
    exact: false,
    isDefault: false,
    Component: Login,
  },
];

export default routes;

export const defaultRoute = routes.find((route) => route.isDefault);
