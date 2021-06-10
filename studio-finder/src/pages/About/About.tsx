import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

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

About.contextType = AppContext;

export default About;
