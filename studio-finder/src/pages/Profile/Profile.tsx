import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';

// css
import './Profile.css';

class Profile extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Profile - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

export default Profile;
