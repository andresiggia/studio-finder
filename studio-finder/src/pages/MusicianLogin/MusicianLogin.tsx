import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import LoginSignUp from '../../components/LoginSignUp/LoginSignUp';

// services
import i18n from '../../services/i18n/i18n';
import { RouteNames } from '../../services/routes/routes';

// constants
import { USER_TYPES } from '../../constants/user-types';

class MusicianLogin extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginSignUp
            routeName={RouteNames.musicianLogin}
            userType={USER_TYPES.musician}
            title={i18n.t('Musician Log In / Sign Up')}
            defaultScreen={RouteNames.login}
          />
        </IonContent>
      </IonPage>
    );
  }
}

export default MusicianLogin;
