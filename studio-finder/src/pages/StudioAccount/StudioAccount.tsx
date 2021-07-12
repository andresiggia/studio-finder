import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// constants
import { USER_TYPES } from '../../constants/user-types';

// components
import Header from '../../components/Header/Header';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';

// css
import './StudioAccount.css';

class StudioAccount extends React.Component<UserValidationProps> {
  render() {
    const { state } = this.context;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Studio Account - Under development</p>
          {!!state.user && (
            <p>{`Email: ${state.user.email}`}</p>
          )}
        </IonContent>
      </IonPage>
    );
  }
}

StudioAccount.contextType = AppContext;

export default withUserValidation(USER_TYPES.studio)(StudioAccount);
