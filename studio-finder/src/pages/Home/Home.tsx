import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import ExploreContainer from '../../components/ExploreContainer/ExploreContainer';
import Header from '../../components/Header/Header';

// css
import './Home.css';

class Home extends React.Component {
  render() {
    return (
      <IonPage>
        <Header />
        <IonContent fullscreen>
          <ExploreContainer />
        </IonContent>
      </IonPage>
    );
  }
}

Home.contextType = AppContext;

export default Home;
