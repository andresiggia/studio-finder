import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeOutline } from 'ionicons/icons';
import { IonButton, IonIcon } from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Notification.css';

export interface NotificationProps {
  header?: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'danger',
  className?: string,
  onDismiss?: () => void,
}

class Notification extends React.Component<NotificationProps> {
  render() {
    const {
      header, message, type, className, onDismiss,
    } = this.props;
    return (
      <div className={`notification notification-${type} ${className || ''}`}>
        <div className="notification-content">
          {header && (
            <div className="notification-header">
              {header}
            </div>
          )}
          <div className="notification-message">
            {message}
          </div>
          {!!onDismiss && (
            <IonButton
              color="light"
              fill="clear"
              className="notification-close"
              onClick={onDismiss}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          )}
        </div>
      </div>
    );
  }
}

export default Notification;
