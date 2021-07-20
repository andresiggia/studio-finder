import React from 'react';
import {
  IonContent, IonPage,
} from '@ionic/react';

// constants
import { USER_TYPES } from '../../constants/user-types';

// components
import Header from '../../components/Header/Header';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';
import AccountBase from '../../components/AccountBase/AccountBase';

// css
import './StudioAccount.css';

class StudioAccount extends React.Component<UserValidationProps> {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <AccountBase {...this.props} />
        </IonContent>
      </IonPage>
    );
  }
}

export default withUserValidation(USER_TYPES.studio)(StudioAccount);
