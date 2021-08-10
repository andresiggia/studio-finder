import React from 'react';
import {
  IonChip, IonIcon, IonLabel,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  closeCircle,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { getFilename } from '../../services/helpers/misc';

// css
import './Filename.css';

interface Props {
  name: string,
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark',
  title?: string,
  disabled?: boolean,
  onRemove: () => void,
}

class Filename extends React.Component<Props> {
  render() {
    const {
      name, color = 'primary', title = i18n.t('Remove'), disabled = false, onRemove,
    } = this.props;
    const cleanName = getFilename(name);
    return (
      <IonChip
        color={color}
        title={title}
        disabled={disabled}
        onClick={() => onRemove()}
      >
        <IonLabel>{cleanName}</IonLabel>
        <IonIcon icon={closeCircle} ariaLabel={title} />
      </IonChip>
    );
  }
}

export default Filename;
