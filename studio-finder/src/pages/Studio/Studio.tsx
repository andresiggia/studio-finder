import React from 'react';
import {
  IonContent, IonPage, IonText,
} from '@ionic/react';

// components
import Header from '../../components/Header/Header';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Studio.css';

class Studio extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonText className="page-title">
            {i18n.t('Studio Page')}
          </IonText>
          <p>Coming soon</p>
        </IonContent>
      </IonPage>
    );
  }
}

export default Studio;
