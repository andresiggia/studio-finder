import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonContent, IonPage, IonModal, IonToolbar, IonIcon, IonButton, IonButtons, IonSegment,
  IonSegmentButton, IonLabel, IonList, IonItem, IonInput, IonTitle,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// services
import i18n from '../../services/i18n/i18n';
import { getRoutesByName, RouteNames } from '../../services/routes/routes';

// css
import './LoginSignUp.css';

interface State {
  isOpen: boolean;
  email: string;
  password: string;
  passwordRepeat: string;
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

  onClose = () => {
    const { location, history } = this.props;
    const backUrl = LoginSignUp.getSearchParam(location, 'backUrl') || '/';
    history.push(backUrl);
  }

  onRouteChange = (e: any) => {
    const { location, history } = this.props;
    const query = new URLSearchParams(location.search);
    query.set('screen', e.detail.value || '');
    history.push(`${location.pathname}?${query.toString()}`);
  }

  onSubmit = () => {
    // to do
  }

  // render

  renderForm = () => {
    const {
      email, password, passwordRepeat,
    } = this.state;
    const screen = this.getScreen();
    return (
      <form onSubmit={this.onSubmit}>
        <IonList className="login-form">
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
