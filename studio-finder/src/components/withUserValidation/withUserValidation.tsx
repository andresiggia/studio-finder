import React, { ComponentClass, FunctionComponent } from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router';

// context
import AppContext from '../../context/AppContext';

// services
import { getRoutesByName, RouteNames } from '../../services/routes/routes';

// constants
import { UserType } from '../../services/api/user';

export interface InjectedProps {
  userType: string;
}

export type UserValidationProps = RouteComponentProps & InjectedProps;

const withUserValidation = (userType = UserType.musician) => <TOriginalProps extends RouteComponentProps>(
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
        case UserType.studio:
          return RouteNames.studioLogin;
        case UserType.musician:
        default:
          return RouteNames.login;
      }
    }

    getCreateProfileRouteName = () => {
      switch (userType) {
        case UserType.studio:
          return RouteNames.studioAccount;
        case UserType.musician:
        default:
          return RouteNames.account;
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
      } else if (!state.user.user_metadata?.type || !state.profile) {
        const [route] = getRoutesByName([this.getCreateProfileRouteName()]);
        const isProfileActive = matchPath(match.path, {
          path: route.path,
          exact: route.exact,
          strict: route.strict,
        });
        if (!isProfileActive) {
          // eslint-disable-next-line no-console
          console.log('redirecting user to create profile...', {
            userType: state.user.user_metadata?.type, userProfile: state.profile,
          });
          history.push(route.path);
        }
      } else if (state.user.user_metadata.type !== userType) {
        // redirect to correct page
        const routePath = getDefaultLoggedInRoutePath(state.user.user_metadata.type);
        history.push(routePath);
      }
    }

    render() {
      const { state } = this.context;
      if (!state.user) {
        return null;
      }
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
