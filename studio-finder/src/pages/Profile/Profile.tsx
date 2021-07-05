import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// css
import './Profile.css';

class Profile extends React.Component<RouteComponentProps> {
  render() {
    const { history, location } = this.props;
    const { state, getLoginUrl } = this.context;
    if (!state.user) {
      history.push(getLoginUrl({
        redirectTo: location.pathname,
      }));
      return null;
    }
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Profile - Under development</p>
        </IonContent>
      </IonPage>
    );
  }
}

Profile.contextType = AppContext;

export default withRouter(Profile);
