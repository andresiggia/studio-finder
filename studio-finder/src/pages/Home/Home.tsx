import React from 'react';
import {
  IonContent, IonPage, IonText,
} from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import StudioSearch from '../../components/StudioSearch/StudioSearch';
import StudioList from '../../components/StudioList/StudioList';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Home.css';

class Home extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonText className="page-title">
            {i18n.t('Book a studio space for rehearsal or recording near you')}
          </IonText>
          <StudioSearch />
          <IonText className="page-subtitle">
            {i18n.t('Latest additions')}
          </IonText>
          <StudioList />
        </IonContent>
      </IonPage>
    );
  }
}

export default Home;
