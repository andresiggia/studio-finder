import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// css
import './StudioAccount.css';
import { RouteNames } from '../../services/routes/routes';

class StudioAccount extends React.Component<RouteComponentProps> {
  componentDidMount() {
    this.checkLogin();
  }

  componentDidUpdate() {
    this.checkLogin();
  }

  checkLogin = () => {
    const { history, location } = this.props;
    const { state, getLoginPath } = this.context;
    if (!state.user) {
      const loginUrl = getLoginPath({
        redirectTo: location.pathname,
        parentRoute: RouteNames.musicianLogin,
      });
      history.push(loginUrl);
    }
  }

  render() {
    const { state } = this.context;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Studio Account - Under development</p>
          {!!state.user && (
            <p>{`Email: ${state.user.email}`}</p>
          )}
        </IonContent>
      </IonPage>
    );
  }
}

StudioAccount.contextType = AppContext;

export default withRouter(StudioAccount);
