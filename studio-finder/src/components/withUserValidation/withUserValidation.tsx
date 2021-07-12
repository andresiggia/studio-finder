import React, { ComponentClass, FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

// context
import AppContext from '../../context/AppContext';

// services
import { RouteNames } from '../../services/routes/routes';

export type UserValidationProps = RouteComponentProps;

const withUserValidation = (
  Component: (ComponentClass<UserValidationProps> | FunctionComponent<UserValidationProps>),
) => {
  class ValidatedUser extends React.Component<UserValidationProps> {
    componentDidMount() {
      this.checkLogin();
    }

    componentDidUpdate() {
      this.checkLogin();
    }

    checkLogin = () => {
      const { history, location } = this.props;
      const { state, getLoginPath } = this.context;
      if (!state.user) {
        const loginUrl = getLoginPath({
          redirectTo: location.pathname,
          parentRoute: RouteNames.musicianLogin,
        });
        history.push(loginUrl);
      }
    }

    render(): JSX.Element {
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Component {...this.props} />
      );
    }
  }
  ValidatedUser.contextType = AppContext;
  return withRouter(ValidatedUser);
};

export default withUserValidation;
