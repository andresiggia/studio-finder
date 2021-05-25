import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// css
import './Login.css';

class Login extends React.Component {
  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Login</IonTitle>
            </IonToolbar>
          </IonHeader>
        </IonContent>
      </IonPage>
    );
  }
}

Login.contextType = AppContext;

export default Login;
