import React from 'react';
import {
  IonButton, IonIcon, IonLabel,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  chevronBack, chevronForward,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Pagination.css';

interface Props {
  limit: number,
  count: number,
  start: number,
  disabled: boolean,
  itemsLength: number,
  className: string,
  onChange: (start: number) => void,
}

class Pagination extends React.Component<Props> {
  render() {
    const {
      limit, count, start, disabled, itemsLength, className, onChange,
    } = this.props;
    return (
      <div className={`pagination ${className || ''}`}>
        <IonButton
          size="small"
          fill="outline"
          disabled={disabled || (start - limit) < 0}
          title={i18n.t('Back')}
          onClick={() => onChange(start - limit)}
        >
          <IonIcon icon={chevronBack} />
        </IonButton>
        <IonLabel>
          {i18n.t('Showing item {{current}} - {{count}} out of {{total}}', {
            count: start + itemsLength,
            current: String(start + 1),
            total: String(count),
          })}
        </IonLabel>
        <IonButton
          size="small"
          fill="outline"
          disabled={disabled || (start + limit) >= count}
          title={i18n.t('Forward')}
          onClick={() => onChange(start + limit)}
        >
          <IonIcon icon={chevronForward} />
        </IonButton>
      </div>
    );
  }
}

export default Pagination;
