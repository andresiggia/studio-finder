import React from 'react';
import {
  IonButton, IonCol, IonGrid, IonLabel, IonList, IonRow,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceProfile } from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';
import { BookingDate, BookingItem, defaultBookingItem } from '../../services/api/bookingItems';
import { sortByKey } from '../../services/helpers/misc';

import BookingBarItem from './BookingBarItem';

// css
import './BookingBar.css';

interface Props {
  studioProfile: StudioProfile,
  spaces: SpaceProfile[],
  bookingDates: BookingDate[],
  onRemove: (bookingItem: BookingItem) => void,
  onClear: () => void,
  onSubmit: (bookingItems: BookingItem[]) => void,
  scrollIntoView: () => void,
}

class BookingBar extends React.Component<Props> {
  componentDidMount() {
    const { scrollIntoView } = this.props;
    scrollIntoView();
  }

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
                  const spaceProfile = spaces.find((spaceItem) => spaceItem.id === bookingItem.spaceId);
                  if (!spaceProfile) {
                    return null;
                  }
                  return (
                    <BookingBarItem
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      bookingItem={bookingItem}
                      spaceProfile={spaceProfile}
                      onRemove={onRemove}
                    />
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
