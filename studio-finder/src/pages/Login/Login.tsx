import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// css
import './Login.css';

class Login extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Login - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

Login.contextType = AppContext;

export default Login;
