import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';

class Profile extends React.Component<UserValidationProps> {
  render() {
    const { userType } = this.props;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <ProfileForm userType={userType} />
        </IonContent>
      </IonPage>
    );
  }
}

export default withUserValidation()(Profile);
