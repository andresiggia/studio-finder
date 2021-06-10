import React from 'react';
import {
  IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
} from '@ionic/react';
import {
  Link, RouteComponentProps, withRouter, matchPath,
} from 'react-router-dom';

import i18n from '../../services/i18n/i18n';
import { defaultRoute, getRoutesByName } from '../../services/routes/routes';

// css
import './Header.css';

class Header extends React.Component<RouteComponentProps> {
  render() {
    const { match } = this.props;
    return (
      <IonHeader>

        <IonToolbar>
          <IonTitle slot="start" className="header-title">
            <Link to={defaultRoute?.path || ''}>
              Studio
              <strong>Finder</strong>
            </Link>
          </IonTitle>

          <IonButtons>
            {getRoutesByName(['home', 'about', 'studioLogin']).map((route) => {
              const isActive = matchPath(match.path, {
                path: route.path,
                exact: route.exact,
                strict: route.strict,
              });
              return (
                <Link to={route.path}>
                  <IonButton fill={isActive ? 'solid' : 'clear'} color="primary">
                    {route.getLabel()}
                  </IonButton>
                </Link>
              );
            })}
          </IonButtons>

          <IonButtons slot="end">
            {getRoutesByName(['login']).map((route) => (
              <IonButton fill="outline" color="primary">
                {route.getLabel()}
              </IonButton>
            ))}
            {getRoutesByName(['signUp']).map((route) => (
              <IonButton fill="solid" color="primary">
                {route.getLabel()}
              </IonButton>
            ))}
          </IonButtons>
        </IonToolbar>

      </IonHeader>
    );
  }
}

export default withRouter(Header);
