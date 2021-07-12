import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

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
          <p>Home - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

export default Home;
