import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import LoginForm from '../../components/LoginForm/LoginForm';

// services
import i18n from '../../services/i18n/i18n';
import { RouteName, LoginRouteName } from '../../services/routes/routes';

// constants
import { UserType } from '../../services/api/users';

class StudioLogin extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginForm
            routeName={RouteName.studioLogin}
            userType={UserType.studio}
            title={i18n.t('Studio Log In / Sign Up')}
            defaultScreen={LoginRouteName.login}
          />
        </IonContent>
      </IonPage>
    );
  }
}

export default StudioLogin;
