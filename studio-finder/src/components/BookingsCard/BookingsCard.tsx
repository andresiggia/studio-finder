import React from 'react';
import {
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
  IonGrid, IonIcon, IonItem, IonList, IonModal, IonSpinner, IonText, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  closeOutline, createOutline, timerOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { BookingItemWithBooking, getBookingItemsByUser } from '../../services/api/bookingItems';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingForm from '../BookingForm/BookingForm';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingsCard.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: BookingItemWithBooking[] | null,
  showModal: boolean,
  modalSelectedId: number,
  showPastItems: boolean,
}

class BookingsCard extends React.Component<any, State> {
  mounted = false

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      showModal: false,
      modalSelectedId: 0,
      showPastItems: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentWillUnmount() {
    this.setMountedState({
      showModal: false,
    });
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
        const { showPastItems } = this.state;
        const items = await getBookingItemsByUser(this.context, {
          showPastItems,
        });
        // eslint-disable-next-line no-console
        console.log('got user bookings', items);
        this.setMountedState({
          isLoading: false,
          items,
          // selectedId,
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

  onModalOpen = (modalSelectedId = 0) => {
    this.setMountedState({
      showModal: true,
      modalSelectedId,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModal: false,
    });
  }

  // render

  renderItems = (items: BookingItemWithBooking[]) => {
    if (items.length === 0) {
      return (
        <p>{i18n.t('No bookings found')}</p>
      );
    }
    const weekdayFormat = new Intl.DateTimeFormat(i18n.languages, { weekday: 'short' });
    const dateFormat = new Intl.DateTimeFormat(i18n.languages, { dateStyle: 'long' });
    const timeFormat = new Intl.DateTimeFormat(i18n.languages, { timeStyle: 'short' });
    return (
      <IonList>
        {items.map((bookingItem) => {
          let startDateTimeLabel = '';
          let endDateTimeLabel = '';
          let dateLabel = '';
          if (bookingItem.startAt && bookingItem.endAt) {
            const startTimeStr = timeFormat.format(bookingItem.startAt);
            const endTimeStr = timeFormat.format(bookingItem.endAt);
            const startDateStr = `(${weekdayFormat.format(bookingItem.startAt)}) ${dateFormat.format(bookingItem.startAt)}`;
            const endDateStr = `(${weekdayFormat.format(bookingItem.endAt)}) ${dateFormat.format(bookingItem.endAt)}`;
            if (startDateStr === endDateStr) { // same date, different times
              dateLabel = `${startDateStr}, ${startTimeStr}-${endTimeStr}`;
            } else { // different dates and times
              startDateTimeLabel = `${startDateStr} ${startTimeStr}`;
              endDateTimeLabel = `${endDateStr} ${endTimeStr}`;
            }
          }
          const totalHourslabel = `(${i18n.t('{{count}} hour', { count: bookingItem.quantity })})`;
          const serviceLabel = bookingItem.serviceTitle || `(${i18n.t('Unnamed service')})`;
          return (
            <IonItem key={bookingItem.id}>
              <p>
                <IonText color={bookingItem.inactive ? 'medium' : 'primary'}>
                  {`${serviceLabel} @${bookingItem.studioTitle}/${bookingItem.spaceTitle}${
                    bookingItem.inactive ? ` (${i18n.t('cancelled')})` : ''
                  }`}
                </IonText>
                <br />
                {dateLabel
                  ? (
                    <>
                      {`${i18n.t('Date')}: ${dateLabel}`}
                      <br />
                    </>
                  ) : (
                    <>
                      {`${i18n.t('Start')}: ${startDateTimeLabel}`}
                      <br />
                      {`${i18n.t('End')}: ${endDateTimeLabel}`}
                      <br />
                    </>
                  )}
                <IonText color="medium">
                  {` ${totalHourslabel}`}
                </IonText>
              </p>
              <IonButton
                slot="end"
                fill="clear"
                type="button"
                title={i18n.t('View/Modify Booking')}
                onClick={() => this.onModalOpen(bookingItem.bookingId)}
              >
                <IonIcon icon={createOutline} />
              </IonButton>
            </IonItem>
          );
        })}
      </IonList>
    );
  }

  renderContent = () => {
    const { isLoading, error, items } = this.state;
    return (
      <>
        {isLoading && (
          <div className="bookings-card-loading bookings-card-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="bookings-card-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {!!items && (
          this.renderItems(items)
        )}
      </>
    );
  }

  renderModal = () => {
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
        cssClass="bookings-card-modal"
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {i18n.t('View/Modify Booking')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              onClick={() => this.onModalClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showModal && (
            <BookingForm
              id={modalSelectedId}
              onCancel={() => this.onModalClose()}
              onSave={() => {
                this.onModalClose();
                this.loadItems();
              }}
            />
          )}
        </IonContent>
      </IonModal>
    );
  }

  render() {
    const { showPastItems } = this.state;
    return (
      <>
        <IonCard>
          <IonCardHeader className="bookings-card-header">
            <IonCardTitle>
              {i18n.t('My Bookings')}
            </IonCardTitle>
            <IonButtons>
              <IonButton
                type="button"
                color={showPastItems ? 'primary' : ''}
                fill="clear"
                title={i18n.t('Show Past Bookings')}
                onClick={() => this.setMountedState({
                  showPastItems: !showPastItems,
                }, () => this.loadItems())}
              >
                <IonIcon slot="start" icon={timerOutline} ariaLabel={i18n.t('Show Past Bookings')} />
                {i18n.t('Past')}
              </IonButton>
            </IonButtons>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              {this.renderContent()}
            </IonGrid>
          </IonCardContent>
        </IonCard>
        {this.renderModal()}
      </>
    );
  }
}

BookingsCard.contextType = AppContext;

export default BookingsCard;
