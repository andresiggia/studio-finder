import React from 'react';
import {
  IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonSpinner, IonToast,
} from '@ionic/react';
import {
  Link, RouteComponentProps, withRouter, matchPath,
} from 'react-router-dom';

// services
import {
  defaultRoute, getRoutesByName, Route, RouteNames, LoginRouteNames,
} from '../../services/routes/routes';
import i18n from '../../services/i18n/i18n';

// constants
import { USER_TYPES } from '../../constants/user-types';

// components
import AppContext from '../../context/AppContext';

// css
import './Header.css';

interface State {
  isLoading: boolean,
  error: Error | null,
}

class Header extends React.Component<RouteComponentProps, State> {
  mounted = false

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else if (typeof callback === 'function') {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      callback();
    }
  }

  onLogout = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { supabase } = this.context;
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        this.setMountedState({
          isLoading: false,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - onLogout', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  // render

  renderLoginButtons = () => (
    getRoutesByName([RouteNames.login]).map((route) => (
      <React.Fragment key={route.name}>
        {!!route.routes && (
          route.routes.map((subRoute) => {
            const { location, match } = this.props;
            const { getLoginPath } = this.context;
            const isActive = matchPath(match.path, {
              path: route.path,
              exact: route.exact,
              strict: route.strict,
            });
            return this.renderRoute(subRoute, {
              path: getLoginPath({
                screen: subRoute.path,
                backUrl: location.pathname,
                parentRoute: RouteNames.login,
              }),
              disabled: !!isActive,
            });
          })
        )}
      </React.Fragment>
    ))
  )

  renderMainLinks = () => (
    getRoutesByName([RouteNames.home, RouteNames.about])
      .map((route) => this.renderRoute(route))
  )

  renderAccountLink = () => {
    const { state } = this.context;
    let routeName = RouteNames.account;
    if (state.user.user_metadata?.type === USER_TYPES.studio) {
      routeName = RouteNames.studioAccount;
    }
    return getRoutesByName([routeName]).map((route) => this.renderRoute(route));
  }

  renderLogout = () => (
    <IonButton fill="clear" onClick={this.onLogout}>
      {i18n.t('Logout')}
    </IonButton>
  )

  renderRoute = (route: Route, options: {
    path?: string, fill?: string, color?: string, disabled?: boolean,
  } = {}) => {
    const { match } = this.props;
    const isActive = matchPath(match.path, {
      path: route.path,
      exact: route.exact,
      strict: route.strict,
    });
    return (
      <Link key={route.path} to={options.path || route.path}>
        <IonButton
          disabled={options.disabled}
          fill={options.fill || isActive ? 'solid' : 'clear'}
          color={options.color || 'primary'}
        >
          {route.getLabel ? route.getLabel() : ''}
        </IonButton>
      </Link>
    );
  }

  renderStudioLogin = () => {
    const { location } = this.props;
    const { isLoading } = this.state;
    const { state, getLoginPath } = this.context;
    if (isLoading) {
      return (
        <IonSpinner slot="end" name="bubbles" />
      );
    }
    if (state.user) {
      return null;
    }
    return (
      getRoutesByName([RouteNames.studioLogin]).map((route) => {
        if (!Array.isArray(route?.routes)) {
          return null;
        }
        const [subRoute] = getRoutesByName([LoginRouteNames.login], route.routes);
        return this.renderRoute(route, {
          path: getLoginPath({
            screen: subRoute.path,
            backUrl: location.pathname,
            parentRoute: RouteNames.studioLogin,
          }),
        });
      })
    );
  }

  renderRightMenu = () => {
    const { isLoading } = this.state;
    const { state } = this.context;
    if (isLoading) {
      return (
        <IonSpinner slot="end" name="bubbles" />
      );
    }

    return (
      <IonButtons slot="end">
        {state.user
          ? (
            <>
              {this.renderAccountLink()}
              {this.renderLogout()}
            </>
          ) : this.renderLoginButtons()}
      </IonButtons>
    );
  }

  render() {
    const { error } = this.state;
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
            {this.renderStudioLogin()}
          </IonButtons>

          {this.renderRightMenu()}
        </IonToolbar>

        <IonToast
          isOpen={!!error}
          onDidDismiss={() => this.setMountedState({ error: null })}
          message={error?.message}
          position="bottom"
        />

      </IonHeader>
    );
  }
}

Header.contextType = AppContext;

export default withRouter(Header);
