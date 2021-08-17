import React from 'react';
import {
  IonChip, IonLabel, IonSpinner,
} from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';
import { getSpaceServices } from '../../services/api/spaceServices';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// context
import AppContext from '../../context/AppContext';

// css
// import './SpaceServices.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: any[] | null,
}

interface Props {
  spaceId: number,
}

class SpaceServices extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceId } = this.props;
    if (prevProps.spaceId !== spaceId) {
      this.loadItems();
    }
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

  loadItems = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { spaceId } = this.props;
        const items = await getSpaceServices(this.context, { spaceId });
        // eslint-disable-next-line no-console
        console.log('got space services', items);
        this.setMountedState({
          isLoading: false,
          items,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadItems', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  // render

  render() {
    const { isLoading, error, items } = this.state;

    if (isLoading) {
      return (
        <div className="space-list-loading space-list-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="space-list-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }

    if (!items || items.length === 0) {
      return (
        <p>{i18n.t('No services found.')}</p>
      );
    }

    return (
      <div className="space-list-item-services">
        {items.map((item) => {
          const price = item.price
            ? `£ ${item.price.toFixed(2)}`
            : i18n.t('Free');
          const label = `${item.title} (${price})`;
          return (
            <IonChip title={label}>
              <IonLabel>{label}</IonLabel>
            </IonChip>
          );
        })}
      </div>
    );
  }
}

SpaceServices.contextType = AppContext;

export default SpaceServices;
