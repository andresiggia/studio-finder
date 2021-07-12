import React, { ComponentClass, FunctionComponent } from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router';

// context
import AppContext from '../../context/AppContext';

// services
import { getRoutesByName, RouteNames } from '../../services/routes/routes';

// constants
import { USER_TYPES } from '../../constants/user-types';

export interface InjectedProps {
  userType: string;
}

export type UserValidationProps = RouteComponentProps & InjectedProps;

const withUserValidation = (userType = USER_TYPES.musician) => <TOriginalProps extends RouteComponentProps>(
  Component: (ComponentClass<TOriginalProps> | FunctionComponent<TOriginalProps>),
) => {
  class ValidatedUser extends React.Component<TOriginalProps> {
    componentDidMount() {
      this.checkLogin();
    }

    componentDidUpdate() {
      this.checkLogin();
    }

    getParentRouteName = () => {
      switch (userType) {
        case USER_TYPES.studio:
          return RouteNames.studioLogin;
        case USER_TYPES.musician:
        default:
          return RouteNames.login;
      }
    }

    getCreateProfileRouteName = () => {
      switch (userType) {
        case USER_TYPES.studio:
          return RouteNames.studioProfile;
        case USER_TYPES.musician:
        default:
          return RouteNames.profile;
      }
    }

    checkLogin = () => {
      const { history, location, match } = this.props;
      const { state, getLoginPath, getDefaultLoggedInRoutePath } = this.context;
      if (!state.user) {
        const loginUrl = getLoginPath({
          redirectTo: location.pathname,
          parentRoute: this.getParentRouteName(),
        });
        history.push(loginUrl);
      } else if (!state.user.userType) {
        const [route] = getRoutesByName([this.getCreateProfileRouteName()]);
        const isProfileActive = matchPath(match.path, {
          path: route.path,
          exact: route.exact,
          strict: route.strict,
        });
        if (!isProfileActive) {
          // eslint-disable-next-line no-console
          console.log('redirecting user to create profile...');
          history.push(route.path);
        }
      } else if (state.user.userType !== userType) {
        // redirect to correct page
        const routePath = getDefaultLoggedInRoutePath(state.user.userType);
        history.push(routePath);
      }
    }

    render(): JSX.Element {
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Component {...this.props} userType={userType} />
      );
    }
  }
  ValidatedUser.contextType = AppContext;
  return withRouter(ValidatedUser);
};

export default withUserValidation;
