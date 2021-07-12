import React from 'react';
// import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// css
import './ProfileForm.css';

interface Props {
  userType: string,
}

interface State {
  userType: string;
}

class ProfileForm extends React.Component<Props, State> {
  render() {
    const { userType } = this.props;
    return (
      <>
        <p>ProfileForm - Under development</p>
        <p>{`User type: ${userType}`}</p>
      </>
    );
  }
}

ProfileForm.contextType = AppContext;

export default ProfileForm;
