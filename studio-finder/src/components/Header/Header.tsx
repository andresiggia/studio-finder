import React from 'react';
import {
  IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
} from '@ionic/react';

import i18n from '../../services/i18n/i18n';

class Header extends React.Component {
  render() {
    return (
      <IonHeader>

        <IonToolbar>
          <IonTitle slot="start">
            Studio
            <strong>Finder</strong>
          </IonTitle>

          <IonButtons>
            <IonButton fill="clear" color="primary">
              {i18n.t('Home')}
            </IonButton>
            <IonButton fill="clear" color="primary">
              {i18n.t('About')}
            </IonButton>
            <IonButton fill="clear" color="primary">
              {i18n.t('Studio Login')}
            </IonButton>
          </IonButtons>

          <IonButtons slot="end">
            <IonButton fill="outline" color="primary">
              {i18n.t('Log In')}
            </IonButton>
            <IonButton fill="solid" color="primary">
              {i18n.t('Sign Up')}
            </IonButton>
          </IonButtons>
        </IonToolbar>

      </IonHeader>
    );
  }
}

export default Header;
