import React from 'react';
import {
  IonContent, IonGrid, IonPage, IonText,
} from '@ionic/react';

// components
import Header from '../../components/Header/Header';

// services
import i18n from '../../services/i18n/i18n';

// css
import './About.css';

class About extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonText className="page-title">
            {i18n.t('About')}
            &nbsp;Studio
            <strong>Finder</strong>
          </IonText>
          <IonGrid>
            <p className="about-text">
              {/* eslint-disable-next-line max-len */}
              {i18n.t('This application was developed by Andre Siggia for the MSc in Information Systems and Management of the Birkbeck University of London.')}
            </p>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}

export default About;
