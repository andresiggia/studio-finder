import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonButton, IonSegment, IonSegmentButton, IonLabel, IonList, IonGrid, IonRow, IonCol,
  IonItem, IonInput, IonSpinner, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon,
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
  defaultRoute, getRoutesByName, LoginRouteName, RouteName,
} from '../../services/routes/routes';

// css
import './LoginForm.css';

interface State {
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
  title: string,
  userType: string,
  defaultScreen?: string,
}

class LoginForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
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

  static getSearchParam(location: { search: string }, fieldName: string) {
    const query = new URLSearchParams(location.search);
    return query.get(fieldName);
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

  checkLogin = () => {
    const { state, getDefaultLoggedInRoutePath } = this.context;
    const { location, history, userType } = this.props;
    if (state.user) {
      const redirectTo = LoginForm.getSearchParam(location, 'redirectTo');
      const routePath = getDefaultLoggedInRoutePath(userType);
      history.push(redirectTo || routePath || '/');
    }
  }

  getScreen = () => {
    const { location, defaultScreen = LoginRouteName.login } = this.props;
    return LoginForm.getSearchParam(location, 'screen') || defaultScreen;
  }

  onCancel = () => {
    const { location, history } = this.props;
    const backUrl = LoginForm.getSearchParam(location, 'backUrl') || defaultRoute?.path || '/';
    history.push(backUrl);
  }

  changeScreen = (value: string) => {
    const { location, history } = this.props;
    const query = new URLSearchParams(location.search);
    query.set('screen', value || '');
    history.push(`${location.pathname}?${query.toString()}`);
  }

  onScreenChange = (e: any) => {
    const { value } = e.detail;
    this.changeScreen(value);
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

  getForgotPasswordUrl = () => {
    const { match } = this.props;
    const [host] = window.location.href.split(match.url);
    const [route] = getRoutesByName([RouteName.forgotPassword]);
    return `${host}${route.path}`;
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
              email,
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
              email,
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
              this.changeScreen(LoginRouteName.login);
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
          <IonList className="login-form-list">
            {forgotPassword && (
              <IonLabel>
                {i18n.t('Forgot Password')}
              </IonLabel>
            )}
            <IonItem>
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
              onClick={this.onCancel}
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
    const { routeName, title } = this.props;
    const screen = this.getScreen();
    const [route] = getRoutesByName([routeName]);
    if (!route) {
      // eslint-disable-next-line no-console
      console.warn(`${i18n.t('Invalid routeName')} (${routeName})`);
      return null;
    }
    return (
      <IonGrid>
        <IonRow>
          <IonCol size="12" size-lg="4" offset-lg="4" size-md="6" offset-md="3">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  {title}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonSegment
                  value={screen}
                  onIonChange={this.onScreenChange}
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
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }
}

LoginForm.contextType = AppContext;

export default withRouter(LoginForm);
