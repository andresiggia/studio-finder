import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// css
import './StudioLogin.css';

class StudioLogin extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Studio Login - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

StudioLogin.contextType = AppContext;

export default StudioLogin;
