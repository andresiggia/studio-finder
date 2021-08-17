import React from 'react';
import {
  IonIcon, IonItem, IonLabel, IonSpinner, IonText,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeCircle } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { getSpaceServices, SpaceService } from '../../services/api/spaceServices';
import { BookingItem } from '../../services/api/bookingItems';
import { SpaceProfile } from '../../services/api/spaces';

// components
import Notification, { NotificationType } from '../../components/Notification/Notification';

interface Props {
  bookingItem: BookingItem,
  spaceProfile: SpaceProfile,
  onRemove: (bookingItem: BookingItem) => void,
}

interface State {
  spaceServices: SpaceService[],
  isLoading: boolean,
  error: Error | null,
}

class BookingBarItem extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      spaceServices: [],
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { bookingItem } = this.props;
    if (prevProps.bookingItem.spaceId !== bookingItem.spaceId) {
      this.loadData();
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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { bookingItem } = this.props;
        // eslint-disable-next-line no-console
        console.log('loading space services...', bookingItem);
        const spaceServices = await getSpaceServices(this.context, { spaceId: bookingItem.spaceId });
        this.setMountedState({
          isLoading: false,
          spaceServices,
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

  renderView = () => {
    const { spaceProfile, bookingItem, onRemove } = this.props;
    const { spaceServices } = this.state;
    let dateTimeLabel = '';
    if (bookingItem.startAt && bookingItem.endAt) {
      const weekdayFormat = new Intl.DateTimeFormat(i18n.languages, { weekday: 'short' });
      const dateFormat = new Intl.DateTimeFormat(i18n.languages, { dateStyle: 'long' });
      const timeFormat = new Intl.DateTimeFormat(i18n.languages, { timeStyle: 'short' });
      const startTimeStr = timeFormat.format(bookingItem.startAt);
      const endTimeStr = timeFormat.format(bookingItem.endAt);
      const startDateStr = `(${weekdayFormat.format(bookingItem.startAt)}) ${dateFormat.format(bookingItem.startAt)}`;
      const endDateStr = `(${weekdayFormat.format(bookingItem.endAt)}) ${dateFormat.format(bookingItem.endAt)}`;
      if (startDateStr === endDateStr) { // same date, different times
        dateTimeLabel = `${startDateStr} ${startTimeStr} - ${endTimeStr}`;
      } else { // different dates and times
        dateTimeLabel = `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
      }
    }
    const totalHourslabel = `(${i18n.t('{{count}} hour', { count: bookingItem.quantity })})`;
    const spaceService = spaceServices.find((sItem: SpaceService) => sItem.serviceType === bookingItem.serviceType);
    const serviceLabel = spaceService?.title || `(${i18n.t('Unnamed service')})`;
    const priceLabel = `£ ${(bookingItem.quantity * (spaceService?.price || 0)).toFixed(2)}`;
    const spaceLabel = `@${spaceProfile?.title || `${i18n.t('Space')} ${bookingItem.spaceId}`}`;
    const mainLabel = `${serviceLabel} ${spaceLabel}`;
    return (
      // eslint-disable-next-line react/no-array-index-key
      <IonItem>
        <IonLabel title={`${mainLabel} | ${dateTimeLabel} ${totalHourslabel} - ${priceLabel}`}>
          <strong>{mainLabel}</strong>
          &nbsp;|&nbsp;
          {dateTimeLabel}
          <IonText color="medium">
            {` ${totalHourslabel}`}
          </IonText>
        </IonLabel>
        <IonText color="primary" slot="end">
          {priceLabel}
        </IonText>
        <IonIcon
          icon={closeCircle}
          color="danger"
          slot="end"
          onClick={() => onRemove(bookingItem)}
          style={{ cursor: 'pointer' }}
        />
      </IonItem>
    );
  }

  render() {
    const { isLoading, error } = this.state;

    if (isLoading) {
      return (
        <div className="booking-bar-loading">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-bar-notification"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }
    return this.renderView();
  }
}

BookingBarItem.contextType = AppContext;

export default BookingBarItem;
