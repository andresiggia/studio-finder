import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

// components
import Header from '../Header/Header';
import LoginForm from '../LoginForm/LoginForm';

// context
import AppContext from '../../context/AppContext';

// services
import { LoginRouteName, defaultRoute } from '../../services/routes/routes';

// constants
import { UserType } from '../../services/api/users';

interface Props extends RouteComponentProps {
  routeName: string,
  userType: string,
  title: string,
  defaultScreen?: string,
}

class LoginBase extends React.Component<Props, any> {
  static getSearchParam(location: { search: string }, fieldName: string) {
    const query = new URLSearchParams(location.search);
    return query.get(fieldName);
  }

  onLogin = () => {
    const { getDefaultLoggedInRoutePath } = this.context;
    const { location, history } = this.props;
    const redirectTo = LoginBase.getSearchParam(location, 'redirectTo');
    const routePath = getDefaultLoggedInRoutePath(UserType.musician);
    history.push(redirectTo || routePath || '/');
  }

  getScreen = () => {
    const { location, defaultScreen = LoginRouteName.login } = this.props;
    return LoginBase.getSearchParam(location, 'screen') || defaultScreen;
  }

  onScreenChange = (screen: string) => {
    const { location, history } = this.props;
    const query = new URLSearchParams(location.search);
    query.set('screen', screen || '');
    history.push(`${location.pathname}?${query.toString()}`);
  }

  onCancel = () => {
    const { location, history } = this.props;
    const backUrl = LoginBase.getSearchParam(location, 'backUrl') || defaultRoute?.path || '/';
    history.push(backUrl);
  }

  render() {
    const { title, routeName, userType } = this.props;
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <LoginForm
            title={title}
            routeName={routeName}
            userType={userType}
            screen={this.getScreen()}
            onLogin={this.onLogin}
            onScreenChange={this.onScreenChange}
            onCancel={this.onCancel}
          />
        </IonContent>
      </IonPage>
    );
  }
}

LoginBase.contextType = AppContext;

export default withRouter(LoginBase);
