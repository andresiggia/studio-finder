import React from 'react';
import {
  IonCol, IonGrid, IonRow,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import ProfileForm from '../ProfileForm/ProfileForm';
import { UserValidationProps } from '../withUserValidation/withUserValidation';

class AccountBase extends React.Component<UserValidationProps> {
  renderProfile = (hasProfile: boolean) => {
    const { userType } = this.props;
    return (
      <IonCol
        size="12"
        size-md="6"
        offset-md={hasProfile ? '0' : '3'}
        size-lg="4"
        offset-lg={hasProfile ? '0' : '4'}
      >
        <ProfileForm unlockToEdit={hasProfile} userType={userType} />
      </IonCol>
    );
  }

  render() {
    const { state } = this.context;
    const hasProfile = state.user.user_metadata?.type && !!state.profile;
    return (
      <IonGrid>
        <IonRow>
          {this.renderProfile(hasProfile)}
        </IonRow>
      </IonGrid>
    );
  }
}

AccountBase.contextType = AppContext;

export default AccountBase;
