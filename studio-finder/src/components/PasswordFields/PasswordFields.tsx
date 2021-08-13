import React from 'react';
import {
  IonItem, IonInput,
} from '@ionic/react';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// services
import i18n from '../../services/i18n/i18n';

// css
import { MIN_PASSWORD_CHARS } from '../../constants/settings';

interface Props {
  password: string,
  onPasswordChange: (e: any) => void,
  showPasswordRepeat?: boolean
  passwordRepeat?: string,
  onPasswordRepeatChange?: (e: any) => void,
  disabled?: boolean,
  notificationClassName?: string,
}

class PasswordFields extends React.Component<Props> {
  render() {
    const {
      password, passwordRepeat, showPasswordRepeat, onPasswordChange, onPasswordRepeatChange,
      notificationClassName, disabled,
    } = this.props;
    return (
      <>
        <IonItem>
          <IonInput
            value={password}
            type="password"
            required
            disabled={disabled}
            placeholder={i18n.t('Password')}
            onIonChange={onPasswordChange}
          />
        </IonItem>
        {!!password && password.length < MIN_PASSWORD_CHARS && (
          <Notification
            type={NotificationType.danger}
            className={notificationClassName}
            header={i18n.t('Passwords must have a minimum length of {{minChars}}', {
              minChars: String(MIN_PASSWORD_CHARS),
            })}
            message=""
            preventDismiss
          />
        )}
        {showPasswordRepeat && (
          <>
            <IonItem>
              <IonInput
                value={passwordRepeat}
                type="password"
                required
                disabled={disabled}
                placeholder={i18n.t('Repeat password')}
                onIonChange={onPasswordRepeatChange}
              />
            </IonItem>
            {!!passwordRepeat && passwordRepeat !== password && (
              <Notification
                type={NotificationType.danger}
                className={notificationClassName}
                header={i18n.t('Passwords do not match')}
                message=""
                preventDismiss
              />
            )}
          </>
        )}
      </>
    );
  }
}

export default PasswordFields;
