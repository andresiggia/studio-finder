import React from 'react';
import {
  IonButton,
  IonButtons,
  IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow, IonText,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  closeCircle,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceProfile } from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';
import { BookingDate, BookingItem, defaultBookingItem } from '../../services/api/bookingItems';
import { sortByKey } from '../../services/helpers/misc';
import { Service } from '../../services/api/services';

// css
import './BookingBar.css';

interface Props {
  studioProfile: StudioProfile,
  spaces: SpaceProfile[],
  bookingDates: BookingDate[],
  onRemove: (index: number) => void,
  onClear: () => void,
  onSubmit: (bookingItems: BookingItem[]) => void,
}

class BookingBar extends React.Component<Props> {
  getBookingItems = () => {
    const { bookingDates } = this.props;
    const sortedItems = sortByKey(bookingDates.map((item) => ({
      ...item,
      timestamp: item.date.getTime(),
    })), 'timestamp');
    const DEFAULT_PERIOD_MODULE_MS = 1000 * 60 * 30; // 30min
    const bookingItems: BookingItem[] = [];
    sortedItems.forEach((item) => {
      const index = bookingItems.findIndex((bItem) => (
        item.spaceId === bItem.spaceId
        && item.serviceType === bItem.serviceType
        && bItem.endAt?.getTime() === item.date.getTime()
      ));
      const endAt = new Date(item.date.getTime() + DEFAULT_PERIOD_MODULE_MS);
      if (index === -1) {
        bookingItems.push({
          ...defaultBookingItem,
          spaceId: item.spaceId,
          serviceType: item.serviceType,
          startAt: item.date,
          endAt,
        });
      } else {
        bookingItems[index] = {
          ...bookingItems[index],
          endAt,
        };
      }
    });
    return bookingItems;
  }

  render() {
    const {
      spaces, onRemove, onClear, onSubmit,
    } = this.props;
    const { state } = this.context;
    const weekdayFormat = new Intl.DateTimeFormat(i18n.languages, {
      weekday: 'short',
    });
    const dateFormat = new Intl.DateTimeFormat(i18n.languages, {
      dateStyle: 'long',
    });
    const timeFormat = new Intl.DateTimeFormat(i18n.languages, {
      timeStyle: 'short',
    });
    const bookingItems = this.getBookingItems();
    return (
      <div className="booking-bar">
        <IonGrid className="booking-bar-container">
          <IonRow>
            <IonCol size="12" size-md="6" size-lg="8">
              <IonLabel className="booking-bar-label">
                {i18n.t('Booking selection')}
              </IonLabel>
              <IonList className="booking-bar-list">
                {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                {bookingItems.map((bookingItem, index) => {
                  const space = spaces.find((spaceItem) => spaceItem.id === bookingItem.spaceId);
                  const service = state.services?.find((serviceItem: Service) => serviceItem.type === bookingItem.serviceType);
                  let dateTimeLabel = '';
                  let totalHourslabel = '';
                  if (bookingItem.startAt && bookingItem.endAt) {
                    const startTimeStr = timeFormat.format(bookingItem.startAt);
                    const endTimeStr = timeFormat.format(bookingItem.endAt);
                    const startDateStr = `(${weekdayFormat.format(bookingItem.startAt)}) ${dateFormat.format(bookingItem.startAt)}`;
                    const endDateStr = `(${weekdayFormat.format(bookingItem.endAt)}) ${dateFormat.format(bookingItem.endAt)}`;
                    if (startDateStr === endDateStr) { // same date, different times
                      dateTimeLabel = `${startDateStr} ${startTimeStr} - ${endTimeStr}`;
                    } else { // different dates and times
                      dateTimeLabel = `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
                    }
                    const totalHours = (bookingItem.endAt.getTime() - bookingItem.startAt.getTime()) / (1000 * 60 * 60);
                    totalHourslabel = `(${i18n.t('{{totalHours}} hours', { totalHours })})`;
                  }
                  const serviceLabel = `${service?.title || `${i18n.t('Service')} ${bookingItem.serviceType}`}`;
                  const spaceLabel = `@${space?.title || `${i18n.t('Space')} ${bookingItem.spaceId}`}`;
                  const mainLabel = `${serviceLabel} ${spaceLabel}`;
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <IonItem key={index}>
                      <IonLabel title={`${mainLabel} | ${dateTimeLabel} ${totalHourslabel}`}>
                        <strong>{mainLabel}</strong>
                        &nbsp;|&nbsp;
                        {dateTimeLabel}
                        <IonText color="medium">
                          {` ${totalHourslabel}`}
                        </IonText>
                      </IonLabel>
                      <IonIcon
                        icon={closeCircle}
                        color="danger"
                        slot="end"
                        onClick={() => onRemove(index)}
                        style={{ cursor: 'pointer' }}
                      />
                    </IonItem>
                  );
                })}
              </IonList>
            </IonCol>
            <IonCol size="12" size-md="6" size-lg="4">
              <IonLabel className="booking-bar-label">
                {i18n.t('Total')}
              </IonLabel>
              <IonRow>
                <IonCol size="12" size-md="6">
                  <IonButton
                    color="light"
                    fill="outline"
                    expand="block"
                    onClick={() => onClear()}
                  >
                    {i18n.t('Reset')}
                  </IonButton>
                </IonCol>
                <IonCol size="12" size-md="6">
                  <IonButton
                    color="primary"
                    fill="solid"
                    expand="block"
                    onClick={() => onSubmit(bookingItems)}
                  >
                    {i18n.t('Book')}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    );
  }
}

BookingBar.contextType = AppContext;

export default BookingBar;
