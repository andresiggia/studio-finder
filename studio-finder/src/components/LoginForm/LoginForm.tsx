import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  IonButton, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonInput, IonSpinner, IonIcon,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { chevronBackOutline } from 'ionicons/icons';

// constants
import { MIN_PASSWORD_CHARS } from '../../constants/settings';

// context
import AppContext from '../../context/AppContext';

// components
import Notification, { NotificationProps, NotificationType } from '../Notification/Notification';
import PasswordFields from '../PasswordFields/PasswordFields';

// services
import i18n from '../../services/i18n/i18n';
import {
  getRoutesByName, LoginRouteName, RouteName,
} from '../../services/routes/routes';

// css
import './LoginForm.css';

interface State {
  screen: string,
  email: string;
  password: string;
  passwordRepeat: string;
  forgotPassword: boolean,
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
}

interface Props extends RouteComponentProps {
  routeName: string,
  userType: string,
  screen?: string,
  defaultScreen?: string,
  onScreenChange?: (screen: string) => void,
  onCancel: () => void,
  onLogin?: () => void,
}

class LoginForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      screen: '',
      email: '',
      password: '',
      passwordRepeat: '',
      forgotPassword: false,
      isLoading: false,
      error: null,
      notification: null,
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
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  checkLogin = () => {
    const { state } = this.context;
    const { onLogin } = this.props;
    if (state.user && typeof onLogin === 'function') {
      onLogin();
    }
  }

  getForgotPasswordUrl = () => {
    const { match } = this.props;
    const [host] = window.location.href.split(match.url);
    const [route] = getRoutesByName([RouteName.forgotPassword]);
    return `${host}${route.path}`;
  }

  getRedirectUrl = () => {
    const { routeName, match, userType } = this.props;
    const { getLoginPath, getDefaultLoggedInRoutePath } = this.context;
    const redirectPath = getLoginPath({
      parentRoute: routeName, screen: LoginRouteName.login, redirectTo: getDefaultLoggedInRoutePath(userType),
    });
    const [host] = window.location.href.split(match.url);
    return `${host}${redirectPath}`;
  }

  getScreen = () => {
    const { screen: screenProp, onScreenChange, defaultScreen = LoginRouteName.login } = this.props;
    const { screen: screenState } = this.state;
    if (typeof onScreenChange === 'function') {
      return screenProp || defaultScreen;
    }
    return screenState || defaultScreen;
  }

  onScreenChange = (screen: string) => {
    const { onScreenChange } = this.props;
    if (typeof onScreenChange === 'function') {
      onScreenChange(screen);
    } else {
      this.setMountedState({ screen });
    }
  }

  onSubmit = (e: any) => {
    // prevent form from submitting
    e.preventDefault();
    const isValidForm = this.isValidForm();
    if (isValidForm) {
      this.setMountedState({
        isLoading: true,
      }, async () => {
        const screen = this.getScreen();
        try {
          const { email, password, forgotPassword } = this.state;
          const { supabase } = this.context;
          let notification = null;
          const isSignUp = screen === LoginRouteName.signUp;
          if (isSignUp) {
            const { error: signUpError } = await supabase.auth.signUp({
              email: email.toLowerCase().trim(),
              password,
            }, { redirectTo: this.getRedirectUrl() });
            if (signUpError) {
              throw signUpError;
            }
            notification = {
              header: i18n.t('Sign up success'),
              message: i18n.t('Please check your email to confirm your registration before logging in'),
              type: 'success',
            } as NotificationProps;
          } else if (forgotPassword) {
            const { error: forgotPasswordError } = await supabase.auth.api.resetPasswordForEmail(email, {
              redirectTo: this.getForgotPasswordUrl(),
            });
            if (forgotPasswordError) {
              throw forgotPasswordError;
            }
            notification = {
              header: i18n.t('Password reset requested'),
              message: i18n.t('Please check your email for a link to reset your password'),
              type: 'warning',
            } as NotificationProps;
          } else { // log in
            const { error: signInError } = await supabase.auth.signIn({
              email: email.toLowerCase().trim(),
              password,
            });
            if (signInError) {
              throw signInError;
            }
            notification = {
              header: i18n.t('Log in success'),
              message: i18n.t('Please wait while we log you in...'),
              type: 'success',
              preventDismiss: true,
            } as NotificationProps;
          }
          this.setMountedState({
            isLoading: !isSignUp && !forgotPassword, // leave it loading until user is logged in
            notification,
            forgotPassword: false,
          }, () => {
            if (isSignUp) {
              // redirect to login screen after successful sign up
              this.onScreenChange(LoginRouteName.login);
            }
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('error - onSubmit', error);
          this.setMountedState({
            isLoading: false,
            error,
          });
        }
      });
    }
  }

  isValidForm = () => {
    const {
      email, password, passwordRepeat, forgotPassword,
    } = this.state;
    const screen = this.getScreen();
    const isEmailValid = !!email;
    const isPasswordValid = !!password && password.length >= MIN_PASSWORD_CHARS;
    const isPasswordRepeatValid = !!passwordRepeat && password === passwordRepeat;
    if (screen === LoginRouteName.signUp) {
      return isEmailValid && isPasswordValid && isPasswordRepeatValid;
    }
    return isEmailValid && (forgotPassword || isPasswordValid);
  }

  // render

  renderForm = () => {
    const { onCancel } = this.props;
    const {
      email, password, passwordRepeat, isLoading, error, notification, forgotPassword,
    } = this.state;
    const screen = this.getScreen();
    const isValidForm = this.isValidForm();
    const disabled = isLoading || !!error;
    const isSignUp = screen === LoginRouteName.signUp;
    return (
      <form onSubmit={this.onSubmit}>
        <fieldset className="login-form-fieldset" disabled={disabled}>
          <IonList className="login-form-list form-list">
            {forgotPassword && (
              <IonLabel>
                {i18n.t('Forgot Password')}
              </IonLabel>
            )}
            <IonItem className="form-list-item-full">
              <IonInput
                value={email}
                type="email"
                required
                disabled={disabled}
                placeholder={i18n.t('Email')}
                onIonChange={(e) => {
                  this.setMountedState({
                    email: e.detail.value || '',
                  });
                }}
              />
            </IonItem>
            {!forgotPassword && (
              <PasswordFields
                password={password}
                onPasswordChange={(e) => {
                  this.setMountedState({
                    password: e.detail.value || '',
                  });
                }}
                showPasswordRepeat={isSignUp}
                passwordRepeat={passwordRepeat}
                onPasswordRepeatChange={(e) => {
                  this.setMountedState({
                    passwordRepeat: e.detail.value || '',
                  });
                }}
                disabled={disabled}
                notificationClassName="login-spacer"
              />
            )}
            {!isSignUp && (
              <IonButton
                fill="clear"
                size="small"
                disabled={disabled}
                onClick={() => this.setMountedState({ forgotPassword: !forgotPassword })}
              >
                {forgotPassword
                  ? (
                    <>
                      <IonIcon slot="start" icon={chevronBackOutline} />
                      {i18n.t('Back')}
                    </>
                  ) : i18n.t('Forgot password')}
              </IonButton>
            )}
          </IonList>
          <div className="login-footer">
            <IonButton
              color="primary"
              type="submit"
              expand="block"
              disabled={disabled || !isValidForm}
            >
              {i18n.t('Confirm')}
            </IonButton>
            <IonButton
              fill="outline"
              type="button"
              expand="block"
              disabled={disabled}
              onClick={onCancel}
            >
              {i18n.t('Cancel')}
            </IonButton>
            {isLoading && (
              <div className="login-loading login-spacer">
                <IonSpinner name="bubbles" />
              </div>
            )}
            {!!error && (
              <Notification
                type={NotificationType.danger}
                className="login-spacer"
                header={i18n.t('Error')}
                message={error?.message || i18n.t('An error occurred, please try again later')}
                onDismiss={() => this.setMountedState({ error: null })}
              />
            )}
            {!!notification && (
              <Notification
                type={notification?.type}
                className="login-spacer"
                header={notification?.header}
                message={notification?.message}
                preventDismiss={notification?.preventDismiss}
                onDismiss={notification?.onDismiss || (() => this.setMountedState({ notification: null }))}
              />
            )}
          </div>
        </fieldset>
      </form>
    );
  }

  render() {
    const { routeName } = this.props;
    const screen = this.getScreen();
    const [route] = getRoutesByName([routeName]);
    if (!route) {
      // eslint-disable-next-line no-console
      console.warn(`${i18n.t('Invalid routeName')} (${routeName})`);
      return null;
    }
    return (
      <>
        <IonSegment
          value={screen}
          onIonChange={(e: any) => this.onScreenChange(e.detail.value)}
        >
          {!!route.routes && (
            route.routes.map((subRoute) => (
              <IonSegmentButton key={subRoute.name} value={subRoute.name}>
                <IonLabel>
                  {subRoute.getLabel ? subRoute.getLabel() : ''}
                </IonLabel>
              </IonSegmentButton>
            ))
          )}
        </IonSegment>
        {this.renderForm()}
      </>
    );
  }
}

LoginForm.contextType = AppContext;

export default withRouter(LoginForm);
