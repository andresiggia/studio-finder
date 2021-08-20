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
import BookingsCard from '../BookingsCard/BookingsCard';

class AccountBase extends React.Component<UserValidationProps> {
  renderProfileCard = (hasProfile: boolean) => {
    const { userType } = this.props;
    return (
      <ProfileForm unlockToEdit={hasProfile} userType={userType} />
    );
  }

  renderStudioCard = () => (
    <StudioCard />
  )

  renderBookingsCard = () => (
    <BookingsCard />
  )

  render() {
    const { state } = this.context;
    const hasProfile = !!state.user.user_metadata?.type && !!state.profile;
    const isStudio = state.user.user_metadata?.type === UserType.studio;
    return (
      <IonGrid>
        <IonRow>
          <IonCol
            size="12"
            size-md={hasProfile ? 6 : 8}
            offset-md={hasProfile ? 0 : 2}
            size-lg={hasProfile ? 4 : 6}
            offset-lg={hasProfile ? 0 : 3}
          >
            {this.renderProfileCard(hasProfile)}
            {isStudio && (
              this.renderBookingsCard()
            )}
          </IonCol>
          {hasProfile && (
            <IonCol size="12" size-md="6" size-lg="8">
              {isStudio
                ? (
                  this.renderStudioCard()
                ) : (
                  this.renderBookingsCard()
                )}
            </IonCol>
          )}
        </IonRow>
      </IonGrid>
    );
  }
}

AccountBase.contextType = AppContext;

export default AccountBase;
