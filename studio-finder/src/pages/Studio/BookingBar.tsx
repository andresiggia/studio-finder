import React from 'react';
import {
  IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow,
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
import { BookingDate } from '../../services/api/bookingItems';
import { sortByKey } from '../../services/helpers/misc';
import { Service } from '../../services/api/services';

// css
import './BookingBar.css';

interface Props {
  studioProfile: StudioProfile,
  spaces: SpaceProfile[],
  bookingDates: BookingDate[],
  onRemove: (index: number) => void,
}

class BookingBar extends React.Component<Props> {
  render() {
    const { bookingDates, spaces, onRemove } = this.props;
    const { state } = this.context;
    const weekdayFormat = new Intl.DateTimeFormat(i18n.languages, {
      weekday: 'short',
    });
    const dateTimeFormat = new Intl.DateTimeFormat(i18n.languages, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const sortedItems = sortByKey(bookingDates.map((item) => ({
      ...item,
      timestamp: item.date.getTime(),
    })), 'timestamp');
    // let bookingItems = [];
    // sortedItems.forEach((item) => {

    // });
    return (
      <div className="booking-bar">
        <IonGrid className="booking-bar-container">
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonLabel className="booking-bar-label">
                {i18n.t('Booking selection')}
              </IonLabel>
              <IonList className="booking-bar-list">
                {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                {sortedItems.map(({ timestamp, ...item }, index) => {
                  const space = spaces.find((spaceItem) => spaceItem.id === item.spaceId);
                  const service = state.services?.find((serviceItem: Service) => serviceItem.type === item.serviceType);
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <IonItem key={index}>
                      <strong>
                        {`${
                          service?.title || `${i18n.t('Service')} ${item.serviceType}`
                        } @${space?.title || `${i18n.t('Space')} ${item.spaceId}`}`}
                      </strong>
                      <span>&nbsp;|&nbsp;</span>
                      <span>
                        {`(${weekdayFormat.format(item.date)}) ${dateTimeFormat.format(item.date)}`}
                      </span>
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
          </IonRow>
        </IonGrid>
      </div>
    );
  }
}

BookingBar.contextType = AppContext;

export default BookingBar;
