import React from 'react';
import {
  IonCol, IonGrid, IonRow,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// constants
import { UserType } from '../../services/api/users';

// components
import ProfileForm from '../ProfileForm/ProfileForm';
import { UserValidationProps } from '../withUserValidation/withUserValidation';
import StudioCard from '../StudioCard/StudioCard';

class AccountBase extends React.Component<UserValidationProps> {
  renderProfile = (hasProfile: boolean) => {
    const { userType } = this.props;
    return (
      <IonCol
        size="12"
        size-md={hasProfile ? '6' : '8'}
        offset-md={hasProfile ? '0' : '2'}
        size-lg={hasProfile ? '4' : '6'}
        offset-lg={hasProfile ? '0' : '3'}
      >
        <ProfileForm unlockToEdit={hasProfile} userType={userType} />
      </IonCol>
    );
  }

  renderStudioCard = () => (
    <IonCol size="12" size-md="6" size-lg="8">
      <StudioCard />
    </IonCol>
  )

  render() {
    const { state } = this.context;
    const hasProfile = !!state.user.user_metadata?.type && !!state.profile;
    const isStudio = state.user.user_metadata?.type === UserType.studio;
    return (
      <IonGrid>
        <IonRow>
          {this.renderProfile(hasProfile)}
          {hasProfile && (
            <>
              {isStudio && (
                this.renderStudioCard()
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
