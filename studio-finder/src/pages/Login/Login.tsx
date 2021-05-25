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
        <Header />
        <IonContent fullscreen>
          <p>Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

Login.contextType = AppContext;

export default Login;
