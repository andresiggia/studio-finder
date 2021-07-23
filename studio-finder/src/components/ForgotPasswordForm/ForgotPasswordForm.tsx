import React from 'react';
import {
  IonButton, IonList, IonGrid, IonRow, IonCol, IonItem, IonInput, IonSpinner, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// components
import Notification, { NotificationProps, NotificationType } from '../Notification/Notification';

// services
import i18n from '../../services/i18n/i18n';

// css
import './ForgotPasswordForm.css';
import { MIN_PASSWORD_CHARS } from '../../constants/settings';

interface State {
  password: string;
  passwordRepeat: string;
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
}

interface Props {
  accessToken: string,
}

class ForgotPasswordForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      password: '',
      passwordRepeat: '',
      isLoading: false,
      error: null,
      notification: null,
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
    } else {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  onCancel = () => {
    const url = window.location.href.split('#')[0];
    window.location.assign(url);
  }

  onSubmit = (e: any) => {
    // prevent form from submitting
    e.preventDefault();
    const isValidForm = this.isValidForm();
    if (isValidForm) {
      this.setMountedState({
        isLoading: true,
      }, async () => {
        try {
          const { password } = this.state;
          const { supabase } = this.context;
          const { accessToken } = this.props;
          let notification = null;
          const { error } = await supabase.auth.api.updateUser(accessToken, { password });
          if (error) {
            throw error;
          }
          notification = {
            header: i18n.t('Password updated'),
            message: i18n.t('Please use your new password to log in'),
            type: 'success',
            onDismiss: () => this.onCancel(),
          } as NotificationProps;
          this.setMountedState({
            isLoading: false,
            notification,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('error - onSubmit', error);
          this.setMountedState({
            isLoading: false,
            error,
          });
        }
      });
    }
  }

  isValidForm = () => {
    const {
      password, passwordRepeat,
    } = this.state;
    const isPasswordValid = !!password && password.length >= MIN_PASSWORD_CHARS;
    const isPasswordRepeatValid = !!passwordRepeat && password === passwordRepeat;
    return isPasswordValid && isPasswordRepeatValid;
  }

  // render

  renderForm = () => {
    const {
      password, passwordRepeat, isLoading, error, notification,
    } = this.state;
    const isValidForm = this.isValidForm();
    const disabled = isLoading || !!error;
    return (
      <form onSubmit={this.onSubmit}>
        <fieldset className="forgotpass-form-fieldset" disabled={disabled}>
          <IonList className="forgotpass-form-list">
            <IonItem>
              <IonInput
                value={password}
                type="password"
                required
                disabled={disabled}
                placeholder={i18n.t('Password')}
                onIonChange={(e) => {
                  this.setMountedState({
                    password: e.detail.value || '',
                  });
                }}
              />
            </IonItem>
            {!!password && password.length < MIN_PASSWORD_CHARS && (
              <Notification
                type={NotificationType.danger}
                className="forgotpass-spacer"
                header={i18n.t('Passwords must have a minimum length of %MIN_PASSWORD_CHARS%')
                  .replace('%MIN_PASSWORD_CHARS%', String(MIN_PASSWORD_CHARS))}
                message=""
                preventDismiss
              />
            )}
            <IonItem>
              <IonInput
                value={passwordRepeat}
                type="password"
                required
                disabled={disabled}
                placeholder={i18n.t('Repeat password')}
                onIonChange={(e) => {
                  this.setMountedState({
                    passwordRepeat: e.detail.value || '',
                  });
                }}
              />
            </IonItem>
            {!!passwordRepeat && passwordRepeat !== password && (
              <Notification
                type={NotificationType.danger}
                className="forgotpass-spacer"
                header={i18n.t('Passwords do not match')}
                message=""
                preventDismiss
              />
            )}
          </IonList>
          <div className="forgotpass-footer">
            <IonButton
              color="primary"
              type="submit"
              expand="block"
              disabled={disabled || !isValidForm}
            >
              {i18n.t('Confirm')}
            </IonButton>
            <IonButton
              fill="outline"
              type="button"
              expand="block"
              disabled={disabled}
              onClick={this.onCancel}
            >
              {i18n.t('Cancel')}
            </IonButton>
            {isLoading && (
              <div className="forgotpass-loading forgotpass-spacer">
                <IonSpinner name="bubbles" />
              </div>
            )}
            {!!error && (
              <Notification
                type={NotificationType.danger}
                className="forgotpass-spacer"
                header={i18n.t('Error')}
                message={error?.message || i18n.t('An error occurred, please try again later')}
                onDismiss={() => this.setMountedState({ error: null })}
              />
            )}
            {!!notification && (
              <Notification
                type={notification?.type}
                className="forgotpass-spacer"
                header={notification?.header}
                message={notification?.message}
                preventDismiss={notification?.preventDismiss}
                onDismiss={() => this.setMountedState({ notification: null })}
              />
            )}
          </div>
        </fieldset>
      </form>
    );
  }

  render() {
    return (
      <IonGrid>
        <IonRow>
          <IonCol size="12" size-lg="4" offset-lg="4" size-md="6" offset-md="3">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  {i18n.t('Redefine password')}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {this.renderForm()}
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }
}

ForgotPasswordForm.contextType = AppContext;

export default ForgotPasswordForm;
