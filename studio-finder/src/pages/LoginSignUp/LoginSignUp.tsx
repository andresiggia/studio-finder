import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonContent, IonPage, IonModal, IonToolbar, IonIcon, IonButton, IonButtons, IonSegment,
  IonSegmentButton, IonLabel, IonList, IonItem, IonInput, IonTitle, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import Notification, { NotificationProps } from '../../components/Notification/Notification';

// services
import i18n from '../../services/i18n/i18n';
import { defaultRoute, getRoutesByName, RouteNames } from '../../services/routes/routes';

// css
import './LoginSignUp.css';

interface State {
  isOpen: boolean;
  email: string;
  password: string;
  passwordRepeat: string;
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
}

class LoginSignUp extends React.Component<RouteComponentProps, State> {
  defaultScreen = RouteNames.login

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      isOpen: true,
      email: '',
      password: '',
      passwordRepeat: '',
      isLoading: false,
      error: null,
      notification: null,
    };
  }

  componentDidMount() {
    this.setState({
      isOpen: true,
    });
  }

  componentWillUnmount() {
    this.setState({
      isOpen: false,
    });
  }

  static getSearchParam(location: { search: string }, fieldName: string) {
    const query = new URLSearchParams(location.search);
    return query.get(fieldName);
  }

  getScreen = () => {
    const { location } = this.props;
    return LoginSignUp.getSearchParam(location, 'screen') || this.defaultScreen;
  }

  getDefaultLoggedRoutePath = () => {
    const [defaultLoggedRoute] = getRoutesByName([RouteNames.account]);
    return defaultLoggedRoute.path;
  }

  onClose = () => {
    const { location, history } = this.props;
    const backUrl = LoginSignUp.getSearchParam(location, 'backUrl') || defaultRoute?.path || '/';
    history.push(backUrl);
  }

  onLogin = () => {
    const { location, history } = this.props;
    const redirectTo = LoginSignUp.getSearchParam(location, 'redirectTo') || this.getDefaultLoggedRoutePath() || '/';
    history.push(redirectTo);
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
      this.setState({
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
            } as NotificationProps;
          }
          this.setState({
            isLoading: false,
            notification,
          }, () => this.onLogin);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('error - onSubmit', error);
          this.setState({
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
    return (
      <form onSubmit={this.onSubmit}>
        <fieldset className="login-form-fieldset" disabled={isLoading || !!error}>
          <IonList className="login-form-list">
            <IonItem>
              <IonInput
                value={email}
                type="text"
                required
                placeholder={i18n.t('Email')}
                onIonChange={(e) => {
                  this.setState({
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
                placeholder={i18n.t('Password')}
                onIonChange={(e) => {
                  this.setState({
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
                  placeholder={i18n.t('Repeat password')}
                  onIonChange={(e) => {
                    this.setState({
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
              disabled={!isValidForm}
            >
              {i18n.t('Confirm')}
            </IonButton>
            <IonButton
              fill="outline"
              type="reset"
              expand="block"
              onClick={this.onClose}
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
                onDismiss={() => this.setState({ error: null })}
              />
            )}
            {!!notification && (
              <Notification
                type={notification?.type}
                className="login-spacer"
                header={notification?.header}
                message={notification?.message}
                onDismiss={() => this.setState({ notification: null })}
              />
            )}
          </div>
        </fieldset>
      </form>
    );
  }

  render() {
    const { isOpen } = this.state;
    const screen = this.getScreen();
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonModal
            isOpen={isOpen}
            backdropDismiss={false}
          >
            <IonToolbar>
              <IonTitle>
                {i18n.t('Musician Log In / Sign Up')}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  color="primary"
                  onClick={this.onClose}
                >
                  <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <IonContent>
              <IonSegment
                value={screen}
                onIonChange={this.onRouteChange}
              >
                {getRoutesByName([RouteNames.loginSignUp]).map((route) => (
                  <React.Fragment key={route.name}>
                    {!!route.routes && (
                      route.routes.map((subRoute) => (
                        <IonSegmentButton key={subRoute.name} value={subRoute.name}>
                          <IonLabel>
                            {subRoute.getLabel ? subRoute.getLabel() : ''}
                          </IonLabel>
                        </IonSegmentButton>
                      ))
                    )}
                  </React.Fragment>
                ))}
              </IonSegment>
              {this.renderForm()}
            </IonContent>
          </IonModal>
        </IonContent>
      </IonPage>
    );
  }
}

LoginSignUp.contextType = AppContext;

export default withRouter(LoginSignUp);
