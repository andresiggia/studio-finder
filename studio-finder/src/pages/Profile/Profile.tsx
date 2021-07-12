import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';

// css
import './Profile.css';

class Profile extends React.Component<UserValidationProps> {
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

Profile.contextType = AppContext;

export default withUserValidation()(Profile);
