import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// components
import Header from '../../components/Header/Header';

// css
import './About.css';

class About extends React.Component {
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>About - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

export default About;
