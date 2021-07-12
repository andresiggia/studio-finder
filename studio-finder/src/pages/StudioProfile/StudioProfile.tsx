import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';

// constants
import { USER_TYPES } from '../../constants/user-types';

// css
import './StudioProfile.css';

class StudioProfile extends React.Component<UserValidationProps> {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Studio Profile - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

StudioProfile.contextType = AppContext;

export default withUserValidation(USER_TYPES.studio)(StudioProfile);
