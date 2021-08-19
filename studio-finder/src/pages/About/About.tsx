import React from 'react';
import {
  IonContent, IonGrid, IonPage, IonText,
} from '@ionic/react';

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
          <IonGrid>
            <p className="about-text">
              <IonText color="primary">
                Studio
                <strong>Finder</strong>
              </IonText>
              &nbsp;was developed by Andre Siggia for the MSc in Information Systems and Management of the Birkbeck University of London.
            </p>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}

export default About;
