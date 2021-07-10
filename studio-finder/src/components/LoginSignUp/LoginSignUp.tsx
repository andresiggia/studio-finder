import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonButton, IonSegment, IonSegmentButton, IonLabel, IonList, IonGrid, IonRow, IonCol,
  IonItem, IonInput, IonSpinner, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Notification, { NotificationProps } from '../Notification/Notification';

// services
import i18n from '../../services/i18n/i18n';
import { defaultRoute, getRoutesByName, RouteNames } from '../../services/routes/routes';

// css
import './LoginSignUp.css';

interface State {
  email: string;
  password: string;
  passwordRepeat: string;
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
}

interface Props extends RouteComponentProps {
  routeName: string,
  title: string,
  routeNameAfterLogin?: string,
  defaultScreen?: string,
}

class LoginSignUp extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordRepeat: '',
      isLoading: false,
      error: null,
      notification: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.checkLogin();
  }

  componentDidUpdate(prevProps: Props) {
    const { location } = this.props;
    if (location !== prevProps.location) {
      this.checkLogin();
    }
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
    } else if (typeof callback === 'function') {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      callback();
    }
  }

  checkLogin = () => {
    const { state } = this.context;
    const { location, history } = this.props;
    if (state.user) {
      const redirectTo = LoginSignUp.getSearchParam(location, 'redirectTo');
      const defaultLoggedRoutePath = this.getDefaultLoggedRoutePath();
      history.push(redirectTo || defaultLoggedRoutePath || '/');
    }
  }

  getScreen = () => {
    const { location, defaultScreen = RouteNames.login } = this.props;
    return LoginSignUp.getSearchParam(location, 'screen') || defaultScreen;
  }

  getDefaultLoggedRoutePath = () => {
    const { routeNameAfterLogin } = this.props;
    if (!routeNameAfterLogin) {
      return '';
    }
    const [defaultLoggedRoute] = getRoutesByName([routeNameAfterLogin]);
    return defaultLoggedRoute?.path;
  }

  onCancel = () => {
    const { location, history } = this.props;
    const backUrl = LoginSignUp.getSearchParam(location, 'backUrl') || defaultRoute?.path || '/';
    history.push(backUrl);
  }

  onRouteChange = (e: any) => {
    const { location, history } = this.props;
    const query = new URLSearchParams(location.search);
    query.set('screen', e.detail.value || '');
    history.push(`${location.pathname}?${query.toString()}`);
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
          const { email, password } = this.state;
          const { auth } = this.context;
          let notification = null;
          if (screen === RouteNames.signUp) {
            const { error: signUpError } = await auth.signUp({
              email,
              password,
            });
            if (signUpError) {
              throw signUpError;
            }
            notification = {
              header: i18n.t('Sign up success'),
              message: i18n.t('Please check your email to confirm your registration before logging in'),
              type: 'success',
            } as NotificationProps;
          } else {
            const { error: signInError } = await auth.signIn({
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
            // isLoading: false, // leave it loading until user is logged in
            notification,
          }, () => this.checkLogin());
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
    const { email, password, passwordRepeat } = this.state;
    const screen = this.getScreen();
    const MIN_PASSWORD_CHARS = 4;
    return !!email && !!password && password.length >= MIN_PASSWORD_CHARS
      && (screen !== RouteNames.signUp || (!!passwordRepeat && password === passwordRepeat));
  }

  // render

  renderForm = () => {
    const {
      email, password, passwordRepeat, isLoading, error, notification,
    } = this.state;
    const screen = this.getScreen();
    const isValidForm = this.isValidForm();
    const disabled = isLoading || !!error;
    return (
      <form onSubmit={this.onSubmit}>
        <fieldset className="login-form-fieldset" disabled={disabled}>
          <IonList className="login-form-list">
            <IonItem>
              <IonInput
                value={email}
                type="text"
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
            <IonItem>
              <IonInput
                value={password}
                type="password"
                required
                disabled={disabled}
                placeholder={i18n.t('Password')}
                onIonChange={(e) => {
                  this.setMountedState({
                    password: e.detail.value || '',
                  });
                }}
              />
            </IonItem>
            {screen === RouteNames.signUp && (
              <IonItem>
                <IonInput
                  value={passwordRepeat}
                  type="password"
                  required
                  disabled={disabled}
                  placeholder={i18n.t('Repeat password')}
                  onIonChange={(e) => {
                    this.setMountedState({
                      passwordRepeat: e.detail.value || '',
                    });
                  }}
                />
              </IonItem>
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
                type="danger"
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
                onDismiss={() => this.setMountedState({ notification: null })}
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
                  onIonChange={this.onRouteChange}
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

LoginSignUp.contextType = AppContext;

export default withRouter(LoginSignUp);
