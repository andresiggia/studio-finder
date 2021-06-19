import React from 'react';
import {
  IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
} from '@ionic/react';
import {
  Link, RouteComponentProps, withRouter, matchPath,
} from 'react-router-dom';

// services
import { defaultRoute, getRoutesByName, RouteNames } from '../../services/routes/routes';

// css
import './Header.css';

class Header extends React.Component<RouteComponentProps> {
  render() {
    const { match, location } = this.props;
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
            {getRoutesByName([RouteNames.home, RouteNames.about, RouteNames.studioLogin]).map((route) => {
              const isActive = matchPath(match.path, {
                path: route.path,
                exact: route.exact,
                strict: route.strict,
              });
              return (
                <Link key={route.path} to={route.path}>
                  <IonButton fill={isActive ? 'solid' : 'clear'} color="primary">
                    {route.getLabel ? route.getLabel() : ''}
                  </IonButton>
                </Link>
              );
            })}
          </IonButtons>

          <IonButtons slot="end">
            {getRoutesByName([RouteNames.loginSignUp]).map((route) => (
              <React.Fragment key={route.name}>
                {!!route.routes && (
                  route.routes.map((subRoute) => {
                    const fill = subRoute.name === RouteNames.login
                      ? 'outline'
                      : 'solid';
                    const params = [
                      ['backUrl', location.pathname],
                      ['screen', subRoute.path],
                    ].map((item) => item.join('='));
                    return (
                      <Link key={subRoute.path} to={`${route.path}?${params.join('&')}`}>
                        <IonButton fill={fill} color="primary">
                          {subRoute.getLabel ? subRoute.getLabel() : ''}
                        </IonButton>
                      </Link>
                    );
                  })
                )}
              </React.Fragment>
            ))}
          </IonButtons>
        </IonToolbar>

      </IonHeader>
    );
  }
}

export default withRouter(Header);
