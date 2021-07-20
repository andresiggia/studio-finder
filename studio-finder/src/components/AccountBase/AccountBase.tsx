import React from 'react';
import {
  IonCol, IonGrid, IonRow,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// constants
import { USER_TYPES } from '../../constants/user-types';

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

  renderStudioProfile = () => (
    <IonCol size="12" size-md="6" size-lg="4">
      <p>Coming soon</p>
    </IonCol>
  )

  render() {
    const { state } = this.context;
    const hasProfile = state.user.user_metadata?.type && !!state.profile;
    const isStudio = state.user.user_metadata?.type === USER_TYPES.studio;
    return (
      <IonGrid>
        <IonRow>
          {this.renderProfile(hasProfile)}
          {hasProfile && (
            <>
              {isStudio && (
                this.renderStudioProfile()
              )}
            </>
          )}
        </IonRow>
      </IonGrid>
    );
  }
}

AccountBase.contextType = AppContext;

export default AccountBase;
