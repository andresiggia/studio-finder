import React from 'react';
import { IonButton, IonContent, IonPage } from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import withUserValidation, { UserValidationProps } from '../../components/withUserValidation/withUserValidation';

// services
import { getRoutesByName, RouteNames } from '../../services/routes/routes';
import i18n from '../../services/i18n/i18n';

// css
import './Account.css';

class Account extends React.Component<UserValidationProps> {
  render() {
    const { state } = this.context;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <p>Account - Under development</p>
          {!!state.user && (
            <p>{`Email: ${state.user.email}`}</p>
          )}
          <IonButton
            fill="outline"
            type="button"
            onClick={() => {
              const { history } = this.props;
              const [route] = getRoutesByName([RouteNames.profile]);
              history.push(route.path);
            }}
          >
            {i18n.t('Update Profile')}
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }
}

Account.contextType = AppContext;

export default withUserValidation()(Account);
