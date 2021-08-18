import React from 'react';
import {
  IonChip, IonLabel,
} from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceService } from '../../services/api/spaceServices';

// css
import './SpaceServices.css';

interface Props {
  spaceId: number,
  items: SpaceService[],
}

class SpaceServices extends React.Component<Props> {
  render() {
    const { items } = this.props;

    if (!items || items.length === 0) {
      return (
        <p>{i18n.t('No services found.')}</p>
      );
    }
    return (
      <div className="space-services">
        {items.map((item) => {
          const price = item.price
            ? `£ ${item.price.toFixed(2)}`
            : i18n.t('Free');
          const label = `${item.title} (${price})`;
          return (
            <IonChip key={`${item.spaceId}-${item.title}`} title={label} color="primary">
              <IonLabel>{label}</IonLabel>
            </IonChip>
          );
        })}
      </div>
    );
  }
}

export default SpaceServices;
