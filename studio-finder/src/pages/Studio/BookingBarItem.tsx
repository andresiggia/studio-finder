import React from 'react';
import {
  IonIcon, IonItem, IonLabel, IonText,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeCircle } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { BookingItem } from '../../services/api/bookingItems';
import { SpaceProfile } from '../../services/api/spaces';

interface Props {
  bookingItem: BookingItem,
  spaceProfile: SpaceProfile,
  onRemove: (bookingItem: BookingItem) => void,
}

class BookingBarItem extends React.Component<Props> {
  render() {
    const { spaceProfile, bookingItem, onRemove } = this.props;
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
    const serviceLabel = bookingItem.serviceTitle || `(${i18n.t('Unnamed service')})`;
    const priceLabel = `£ ${(bookingItem.quantity * bookingItem.servicePrice).toFixed(2)}`;
    const spaceLabel = `@${spaceProfile?.title || `${i18n.t('Space')} ${bookingItem.spaceId}`}`;
    const mainLabel = `${serviceLabel} ${spaceLabel}`;
    return (
      // eslint-disable-next-line react/no-array-index-key
      <IonItem>
        <IonLabel title={`${mainLabel} | ${dateTimeLabel} ${totalHourslabel} - ${priceLabel}`}>
          <em>{mainLabel}</em>
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
}

export default BookingBarItem;
