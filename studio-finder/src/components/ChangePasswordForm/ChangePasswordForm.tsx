import React from 'react';
import {
  IonButton, IonCol, IonGrid, IonIcon, IonList, IonRow, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { refreshOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// components
import Notification, { NotificationProps, NotificationType } from '../Notification/Notification';
import PasswordFields from '../PasswordFields/PasswordFields';

// services
import i18n from '../../services/i18n/i18n';

// constants
import { MIN_PASSWORD_CHARS } from '../../constants/settings';

// css
import './ChangePasswordForm.css';

interface Props {
  onCancel?: () => void,
}

interface State {
  password: string;
  passwordRepeat: string;
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
}

class ChangePasswordForm extends React.Component<Props, State> {
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
          const { supabase, state } = this.context;
          const { onCancel } = this.props;
          let notification = null;
          const { error } = await supabase.auth.api.updateUser(state.accessToken, { password });
          if (error) {
            throw error;
          }
          notification = {
            header: i18n.t('Password changed successfully'),
            message: '',
            type: 'success',
            onDismiss: () => {
              if (typeof onCancel === 'function') {
                onCancel();
              } else {
                this.onReset();
              }
            },
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

  onReset = () => {
    this.setMountedState({
      password: '',
      passwordRepeat: '',
      notification: null,
    });
  }

  isValidForm = () => {
    const { password, passwordRepeat } = this.state;
    const isPasswordValid = !!password && password.length >= MIN_PASSWORD_CHARS;
    const isPasswordRepeatValid = !!passwordRepeat && password === passwordRepeat;
    return isPasswordValid && isPasswordRepeatValid;
  }

  hasChanges = () => {
    const { password, passwordRepeat } = this.state;
    return !!password || !!passwordRepeat;
  }

  // render

  render() {
    const { onCancel } = this.props;
    const {
      password, passwordRepeat, isLoading, error, notification,
    } = this.state;
    const isValidForm = this.isValidForm();
    const hasChanges = this.hasChanges();
    const disabled = isLoading || !!error || !!notification;
    return (
      <form onSubmit={this.onSubmit}>
        <fieldset className="changepass-form-fieldset" disabled={disabled}>
          <IonList className="changepass-form-list">
            <PasswordFields
              password={password}
              onPasswordChange={(e) => {
                this.setMountedState({
                  password: e.detail.value || '',
                });
              }}
              showPasswordRepeat
              passwordRepeat={passwordRepeat}
              onPasswordRepeatChange={(e) => {
                this.setMountedState({
                  passwordRepeat: e.detail.value || '',
                });
              }}
              disabled={disabled}
              notificationClassName="login-spacer"
            />
          </IonList>
          <IonGrid>
            <IonRow>
              <IonCol size="12" size-md="6">
                {(hasChanges || typeof onCancel !== 'function')
                  ? (
                    <IonButton
                      fill="outline"
                      type="button"
                      expand="block"
                      disabled={disabled || !hasChanges}
                      onClick={() => this.onReset()}
                    >
                      <IonIcon slot="start" icon={refreshOutline} />
                      {i18n.t('Reset')}
                    </IonButton>
                  ) : (
                    <IonButton
                      fill="outline"
                      type="button"
                      expand="block"
                      disabled={disabled}
                      onClick={() => onCancel()}
                    >
                      {i18n.t('Cancel')}
                    </IonButton>
                  )}
              </IonCol>
              <IonCol size="12" size-md="6">
                <IonButton
                  color="primary"
                  type="submit"
                  expand="block"
                  disabled={disabled || !isValidForm}
                >
                  {i18n.t('Confirm')}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
          {isLoading && (
            <div className="changepass-loading changepass-spacer">
              <IonSpinner name="bubbles" />
            </div>
          )}
          {!!error && (
            <Notification
              type={NotificationType.danger}
              className="changepass-spacer"
              header={i18n.t('Error')}
              message={error?.message || i18n.t('An error occurred, please try again later')}
              onDismiss={() => this.setMountedState({ error: null })}
            />
          )}
          {!!notification && (
            <Notification
              type={notification?.type}
              className="changepass-spacer"
              header={notification?.header}
              message={notification?.message}
              preventDismiss={notification?.preventDismiss}
              onDismiss={notification?.onDismiss || (() => this.setMountedState({ notification: null }))}
            />
          )}
        </fieldset>
      </form>
    );
  }
}

ChangePasswordForm.contextType = AppContext;

export default ChangePasswordForm;
