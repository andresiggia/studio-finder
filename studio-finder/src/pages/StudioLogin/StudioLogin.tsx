import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import LoginForm from '../../components/LoginForm/LoginForm';

// services
import i18n from '../../services/i18n/i18n';
import { RouteNames, LoginRouteNames } from '../../services/routes/routes';

// constants
import { userTypes } from '../../constants/user-types';

class StudioLogin extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginForm
            routeName={RouteNames.studioLogin}
            userType={userTypes.studio}
            title={i18n.t('Studio Log In / Sign Up')}
            defaultScreen={LoginRouteNames.login}
          />
        </IonContent>
      </IonPage>
    );
  }
}

export default StudioLogin;
