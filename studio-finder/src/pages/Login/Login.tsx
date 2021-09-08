import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';

// components
import Header from '../../components/Header/Header';
import LoginBase from '../../components/LoginBase/LoginBase';

// services
import i18n from '../../services/i18n/i18n';
import { RouteName, LoginRouteName } from '../../services/routes/routes';

// constants
import { UserType } from '../../services/api/users';

class Login extends React.Component<RouteComponentProps, any> {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginBase
            routeName={RouteName.login}
            userType={UserType.musician}
            title={i18n.t('Log In / Sign Up')}
            defaultScreen={LoginRouteName.login}
          />
        </IonContent>
      </IonPage>
    );
  }
}

export default Login;
