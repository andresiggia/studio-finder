import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  IonContent, IonPage, IonModal, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Login.css';

interface State {
  isOpen: boolean
}

class Login extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  componentDidMount() {
    this.setState({
      isOpen: true,
    });
  }

  componentWillUnmount() {
    this.setState({
      isOpen: false,
    });
  }

  onClose = () => {
    const { location, history } = this.props;
    const query = new URLSearchParams(location.search);
    const backUrl = query.get('backUrl') || '/';
    history.push(backUrl);
  }

  render() {
    const { isOpen } = this.state;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonModal
            isOpen={isOpen}
            backdropDismiss={false}
          >
            <IonToolbar>
              <IonTitle slot="start" className="header-title">
                Login
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  color="primary"
                  onClick={this.onClose}
                >
                  <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <p>Login - Under development</p>
          </IonModal>
        </IonContent>
      </IonPage>
    );
  }
}

Login.contextType = AppContext;

export default withRouter(Login);
