import React from 'react';
import {
  IonSpinner,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { getSpaceServices, SpaceService } from '../../services/api/spaceServices';

// components
import Notification, { NotificationType } from '../Notification/Notification';

interface Props {
  spaceId: number,
  render: (serviceOptions: SpaceService[]) => any,
}

interface State {
  items: SpaceService[],
  isLoading: boolean,
  error: Error | null,
}

class BookingItemService extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      items: [],
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceId } = this.props;
    if (prevProps.spaceId !== spaceId) {
      this.loadData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { spaceId } = this.props;
        // eslint-disable-next-line no-console
        console.log('loading space services...', spaceId);
        const items = await getSpaceServices(this.context, { spaceId });
        this.setMountedState({
          isLoading: false,
          items,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  // render

  render() {
    const { render } = this.props;
    const { isLoading, error, items } = this.state;

    if (isLoading) {
      return (
        <div className="booking-item-form-loading booking-item-form-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-item-form-notification booking-item-form-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }
    return render(items);
  }
}

BookingItemService.contextType = AppContext;

export default BookingItemService;
