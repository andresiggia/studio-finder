import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';

// components
import Header from '../../components/Header/Header';
import LoginSignUp from '../../components/LoginSignUp/LoginSignUp';

// services
import i18n from '../../services/i18n/i18n';
import { RouteNames } from '../../services/routes/routes';

class MusicianLogin extends React.Component<RouteComponentProps> {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginSignUp
            routeName={RouteNames.musicianLogin}
            routeNameAfterLogin={RouteNames.account}
            title={i18n.t('Musician Log In / Sign Up')}
            defaultScreen={RouteNames.login}
          />
        </IonContent>
      </IonPage>
    );
  }
}

export default withRouter(MusicianLogin);
