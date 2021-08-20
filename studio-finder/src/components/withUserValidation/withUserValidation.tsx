import React, { ComponentClass, FunctionComponent } from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import { IonAlert } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// services
import { getRoutesByName, RouteName } from '../../services/routes/routes';
import i18n from '../../services/i18n/i18n';

// constants
import { UserType } from '../../services/api/users';
import { isValidDate } from '../../services/helpers/misc';

export interface InjectedProps {
  userType: string;
}

export type UserValidationProps = RouteComponentProps & InjectedProps;

interface State {
  isLoading: boolean,
  error: Error | null,
}

const withUserValidation = (userType = UserType.musician) => <TOriginalProps extends RouteComponentProps>(
  Component: (ComponentClass<TOriginalProps> | FunctionComponent<TOriginalProps>),
) => {
  class ValidatedUser extends React.Component<TOriginalProps, State> {
    mounted = false

    constructor(props: any) {
      super(props);
      this.state = {
        isLoading: false,
        error: null,
      };
    }

    componentDidMount() {
      this.mounted = true;
      this.checkLogin();
    }

    componentDidUpdate() {
      this.checkLogin();
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    setMountedState = (state: any, callback?: () => any) => {
      if (this.mounted) {
        this.setState(state, callback);
      } else {
        // eslint-disable-next-line no-console
        console.log('unmounted request', state);
        if (typeof callback === 'function') {
          callback();
        }
      }
    }

    getParentRouteName = () => {
      switch (userType) {
        case UserType.studio:
          return RouteName.studioLogin;
        case UserType.musician:
        default:
          return RouteName.login;
      }
    }

    getCreateProfileRouteName = () => {
      switch (userType) {
        case UserType.studio:
          return RouteName.studioAccount;
        case UserType.musician:
        default:
          return RouteName.account;
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

    onCancel = () => {
      const { supabase } = this.context;
      this.setMountedState({
        isLoading: true,
      }, async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          this.setMountedState({
            isLoading: false,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('error - renderSessionModal - Cancel', error);
          this.setMountedState({
            isLoading: false,
            error,
          });
        }
      });
      return false;
    }

    onLoginRequest = () => {
      const { state, supabase } = this.context;
      this.setMountedState({
        isLoading: true,
      }, async () => {
        try {
          if (state.refreshToken) {
            const { error } = await supabase.auth.signIn({
              refreshToken: state.refreshToken,
            });
            if (error) {
              throw error;
            }
          } else {
            const { error } = await supabase.auth.signOut();
            if (error) {
              throw error;
            }
          }
          this.setMountedState({
            isLoading: false,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('error - renderSessionModal - log in', error);
          this.setMountedState({
            isLoading: false,
            error,
          });
        }
      });
    }

    // render

    renderSessionAlerts = () => {
      const { isLoading, error } = this.state;
      const { state } = this.context;
      if (!isValidDate(state.expiresAt)) {
        return null;
      }
      return (
        <>
          <IonAlert
            backdropDismiss={false}
            isOpen={state.expiresAt.getTime() <= Date.now()}
            onDidDismiss={() => this.setMountedState({
              isLoading: false,
              error: null,
            })}
            header={i18n.t('Timeout')}
            message={i18n.t('Your login session has timed out.')}
            buttons={[
              {
                text: 'Cancel',
                cssClass: 'secondary',
                handler: this.onCancel,
              },
              {
                text: 'Log in',
                cssClass: 'primary',
                handler: this.onLoginRequest,
              },
            ]}
          />
          {isLoading && (
            <IonAlert
              backdropDismiss={false}
              isOpen
              header={i18n.t('Timeout')}
              message={i18n.t('Loading...')}
            />
          )}
          {!!error && (
            <IonAlert
              backdropDismiss={false}
              isOpen
              onDidDismiss={() => this.setMountedState({ error: null })}
              header={i18n.t('Timeout')}
              message={error.message}
              buttons={[{
                text: 'Ok',
                cssClass: 'primary',
              }]}
            />
          )}
        </>
      );
    }

    render() {
      const { state } = this.context;
      if (!state.user) {
        return null;
      }
      return (
        <>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...this.props} userType={userType} />
          {this.renderSessionAlerts()}
        </>
      );
    }
  }
  ValidatedUser.contextType = AppContext;
  return withRouter(ValidatedUser);
};

export default withUserValidation;
