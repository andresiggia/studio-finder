import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';

// context
import AppContext from '../../context/AppContext';

// components
import ExploreContainer from '../../components/ExploreContainer/ExploreContainer';

// css
import './Home.css';

class Home extends React.Component {

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{i18n.t('Home')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{i18n.t('Home')}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <ExploreContainer />
        </IonContent>
      </IonPage>
    );
  }
};

Home.contextType = AppContext;

export default Home;
