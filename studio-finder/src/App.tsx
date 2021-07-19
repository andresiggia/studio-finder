import { Redirect, Route } from 'react-router-dom';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React from 'react';
import { Switch } from 'react-router';

// services
import routes, { defaultRoute } from './services/routes/routes';

// components
import PageRoute from './components/PageRoute/PageRoute';

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

class App extends React.Component {
  render() {
    return (
      <IonApp>
        <IonReactRouter>
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
        </IonReactRouter>
      </IonApp>
    );
  }
}

export default App;
