import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// css
import './Home.css';

class Home extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

Home.contextType = AppContext;

export default Home;
