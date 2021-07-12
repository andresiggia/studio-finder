import React, { ComponentClass, FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

// context
import AppContext from '../../context/AppContext';

// services
import { RouteNames } from '../../services/routes/routes';

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
          return RouteNames.musicianLogin;
      }
    }

    checkLogin = () => {
      const { history, location } = this.props;
      const { state, getLoginPath, getDefaultLoggedInRoutePath } = this.context;
      if (!state.user) {
        const loginUrl = getLoginPath({
          redirectTo: location.pathname,
          parentRoute: this.getParentRouteName(),
        });
        history.push(loginUrl);
      } else if (!state.user.userType) {
        // to do: redirect to create profile
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
