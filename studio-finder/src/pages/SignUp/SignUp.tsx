import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// css
import './SignUp.css';

class SignUp extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>SignUp - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

SignUp.contextType = AppContext;

export default SignUp;
