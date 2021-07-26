import React from 'react';
import {
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonPage, IonRow,
} from '@ionic/react';
import { RouteComponentProps } from 'react-router';

// services
import i18n from '../../services/i18n/i18n';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import Notification, { NotificationType } from '../../components/Notification/Notification';
import ChangePasswordForm from '../../components/ChangePasswordForm/ChangePasswordForm';
import { getRoutesByName, RouteNames } from '../../services/routes/routes';

// css
// import './ForgotPassword.css';

class ForgotPassword extends React.Component<RouteComponentProps> {
  getHashParams = () => {
    const { hash } = window.location;
    if (hash && hash.includes('#')) {
      const params: any = {};
      const hashArr = (hash.split('#')[1]).split('&');
      hashArr.forEach((item: string) => {
        const [key, value] = item.split('=');
        params[key] = value;
      });
      // eslint-disable-next-line no-console
      console.log('hash params found', params);
      return params;
    }
    return null;
  }

  onCancel = () => {
    const { history } = this.props;
    const [route] = getRoutesByName([RouteNames.account]);
    history.push(route.path);
  }

  // render

  renderForm = () => {
    const { state } = this.context;
    const params = this.getHashParams();
    if (state.user || (params?.access_token && params?.type === 'recovery')) {
      return (
        <ChangePasswordForm onCancel={() => this.onCancel()} />
      );
    }
    let title = i18n.t('Error');
    let message = i18n.t('Missing token to redefine password, please try again later.');
    if (params?.error_code) {
      message = i18n.t('An error occurred while requesting to reset your password, please try again later.');
      if (params.error_code === '404') {
        message = i18n.t('User not found');
      } else {
        title = `${i18n.t('Error')} ${params.error_code}`;
      }
    }
    return (
      <Notification
        type={NotificationType.danger}
        header={title}
        message={message}
        preventDismiss
      />
    );
  }

  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonGrid>
            <IonRow>
              <IonCol size="12" size-lg="4" offset-lg="4" size-md="6" offset-md="3">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      {i18n.t('Redefine Password')}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {this.renderForm()}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}

ForgotPassword.contextType = AppContext;

export default ForgotPassword;
