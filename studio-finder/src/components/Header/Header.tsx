import React from 'react';
import {
  IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
} from '@ionic/react';
import {
  Link, RouteComponentProps, withRouter, matchPath,
} from 'react-router-dom';

// services
import {
  defaultRoute, getRoutesByName, Route, RouteNames,
} from '../../services/routes/routes';

// css
import './Header.css';
import AppContext from '../../context/AppContext';

class Header extends React.Component<RouteComponentProps> {
  renderLoginButtons = () => (
    getRoutesByName([RouteNames.loginSignUp]).map((route) => (
      <React.Fragment key={route.name}>
        {!!route.routes && (
          route.routes.map((subRoute) => {
            const { location } = this.props;
            const fill = subRoute.name === RouteNames.login
              ? 'outline'
              : 'solid';
            const { getLoginUrl } = this.context;
            return this.renderRoute(subRoute, {
              fill,
              path: getLoginUrl({
                screen: subRoute.path,
                backUrl: location.pathname,
              }),
            });
          })
        )}
      </React.Fragment>
    ))
  )

  renderMainLinks = () => (
    getRoutesByName([RouteNames.home, RouteNames.about, RouteNames.studioLogin])
      .map((route) => this.renderRoute(route))
  )

  renderAccountLink = () => (
    getRoutesByName([RouteNames.account]).map((route) => this.renderRoute(route))
  )

  renderRoute = (route: Route, options: {
    path?: string, fill?: string, color?: string,
  } = {}) => {
    const { match } = this.props;
    const isActive = matchPath(match.path, {
      path: route.path,
      exact: route.exact,
      strict: route.strict,
    });
    return (
      <Link key={route.path} to={options.path || route.path}>
        <IonButton fill={options.fill || isActive ? 'solid' : 'clear'} color={options.color}>
          {route.getLabel ? route.getLabel() : ''}
        </IonButton>
      </Link>
    );
  }

  render() {
    const { state } = this.context;
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
            {this.renderMainLinks()}
          </IonButtons>

          <IonButtons slot="end">
            {state.user
              ? this.renderAccountLink()
              : this.renderLoginButtons()}
          </IonButtons>
        </IonToolbar>

      </IonHeader>
    );
  }
}

Header.contextType = AppContext;

export default withRouter(Header);
