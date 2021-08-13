import React from 'react';
import {
  IonContent, IonPage, IonText,
} from '@ionic/react';

// components
import Header from '../../components/Header/Header';
import StudioSearch from '../../components/StudioSearch/StudioSearch';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Search.css';

class Search extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonText className="page-title">
            {i18n.t('Search results')}
          </IonText>
          <StudioSearch showResults />
        </IonContent>
      </IonPage>
    );
  }
}

export default Search;
