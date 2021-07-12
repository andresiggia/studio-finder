import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import LoginForm from '../../components/LoginForm/LoginForm';

// services
import i18n from '../../services/i18n/i18n';
import { RouteNames, LoginRouteNames } from '../../services/routes/routes';

// constants
import { USER_TYPES } from '../../constants/user-types';

class Login extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginForm
            routeName={RouteNames.login}
            userType={USER_TYPES.musician}
            title={i18n.t('Musician Log In / Sign Up')}
            defaultScreen={LoginRouteNames.login}
          />
        </IonContent>
      </IonPage>
    );
  }
}

export default Login;
