import { HashRouter, Redirect, Route } from 'react-router-dom';
import { IonApp, IonContent, IonSpinner } from '@ionic/react';
import React from 'react';
import { Switch } from 'react-router';

// services
import routes, { defaultRoute } from './services/routes/routes';
import i18n from './services/i18n/i18n';

// components
import PageRoute from './components/PageRoute/PageRoute';
import Notification, { NotificationType } from './components/Notification/Notification';

// context
import AppContext from './context/AppContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './App.css';

interface State {
  isLoading: boolean,
  error: Error | null,
}

class App extends React.Component<any, State> {
  mounted = false

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadDefinitions();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  loadDefinitions = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { loadDefinitions } = this.context;
        await loadDefinitions();
        this.setMountedState({
          isLoading: false,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadDefinitions', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  renderRouter = () => (
    <HashRouter>
      <Switch>
        {routes.map((route) => {
          const {
            Component, exact, strict, path, getLabel,
          } = route;
          if (!Component) {
            return null;
          }
          return (
            <PageRoute
              key={path}
              title={getLabel ? getLabel() : ''}
              path={path}
              exact={exact}
              strict={strict}
              component={Component}
            />
          );
        }).filter((item) => item)}
        {!!defaultRoute && (
          <Route exact path="/">
            <Redirect to={defaultRoute.path} />
          </Route>
        )}
      </Switch>
    </HashRouter>
  )

  renderView = () => {
    const { isLoading, error } = this.state;
    if (isLoading) {
      return (
        <IonContent fullscreen className="app-loading-container">
          <IonSpinner name="bubbles" className="app-loading" />
        </IonContent>
      );
    }
    if (error) {
      return (
        <IonContent fullscreen>
          <Notification
            type={NotificationType.danger}
            className="app-notification"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        </IonContent>
      );
    }
    return this.renderRouter();
  }

  render() {
    return (
      <IonApp>
        {this.renderView()}
      </IonApp>
    );
  }
}

App.contextType = AppContext;

export default App;
