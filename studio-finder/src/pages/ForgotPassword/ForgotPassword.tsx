import React from 'react';
import { IonContent, IonPage } from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';

// components
import Header from '../../components/Header/Header';
import Notification, { NotificationType } from '../../components/Notification/Notification';
import ForgotPasswordForm from '../../components/ForgotPasswordForm/ForgotPasswordForm';

// css
// import './ForgotPassword.css';

class ForgotPassword extends React.Component {
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

  renderForm = () => {
    const params = this.getHashParams();
    if (params?.access_token && params?.type === 'recovery') {
      return (
        <ForgotPasswordForm
          accessToken={params.access_token}
        />
      );
    }
    return (
      <Notification
        type={NotificationType.danger}
        header={i18n.t('Error')}
        message={i18n.t('Missing token to redefine password, please try again later.')}
        preventDismiss
      />
    );
  }

  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          {this.renderForm()}
        </IonContent>
      </IonPage>
    );
  }
}

export default ForgotPassword;
