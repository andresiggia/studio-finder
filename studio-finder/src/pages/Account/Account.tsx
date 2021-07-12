import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';

// css
import './Account.css';

class Account extends React.Component<UserValidationProps> {
  render() {
    const { state } = this.context;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Account - Under development</p>
          {!!state.user && (
            <p>{`Email: ${state.user.email}`}</p>
          )}
        </IonContent>
      </IonPage>
    );
  }
}

Account.contextType = AppContext;

export default withUserValidation()(Account);
