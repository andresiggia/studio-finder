import React from 'react';
import {
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
  IonGrid, IonIcon, IonItem, IonList, IonModal, IonSpinner, IonText, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  closeOutline, eyeOutline, timerOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { BookingItemWithBooking, getBookingItemsByUser } from '../../services/api/bookingItems';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingForm from '../BookingForm/BookingForm';
import Pagination from '../Pagination/Pagination';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingsCard.css';

interface Props {
  limit: number,
}

interface State {
  isLoading: boolean,
  error: Error | null,
  items: BookingItemWithBooking[] | null,
  count: number,
  start: number,
  showModal: boolean,
  modalSelectedId: number,
  showPastItems: boolean,
}

class BookingsCard extends React.Component<Props, State> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    limit: 3,
  }

  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      count: 0,
      start: 0,
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
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  loadItems = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { limit } = this.props;
        const { showPastItems, start } = this.state;
        const { items, count } = await getBookingItemsByUser(this.context, {
          showPastItems, start, limit,
        });
        // eslint-disable-next-line no-console
        console.log('got user bookings', items);
        this.setMountedState({
          isLoading: false,
          items,
          count,
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

  onPaginationChange = (start: number) => {
    this.setMountedState({
      start,
    }, () => this.loadItems());
  }

  // render

  renderPagination = () => {
    const { limit } = this.props;
    const {
      count, start, isLoading, error, items,
    } = this.state;
    if (!items) {
      return null;
    }
    const disabled = isLoading || !!error || count <= limit;
    return (
      <Pagination
        className="bookings-card-pagination"
        disabled={disabled}
        start={start}
        limit={limit}
        count={count}
        itemsLength={items.length}
        onChange={this.onPaginationChange}
      />
    );
  }

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
                title={i18n.t('View Booking')}
                onClick={() => this.onModalOpen(bookingItem.bookingId)}
              >
                <IonIcon icon={eyeOutline} />
              </IonButton>
            </IonItem>
          );
        })}
        {this.renderPagination()}
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
            {i18n.t('View Booking')}
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
            <>
              <Notification
                type={NotificationType.warning}
                className="bookings-card-spacer"
                header={i18n.t('Read-only')}
                message={i18n.t('To make updates to this booking, please get in touch with the studio directly.')}
              />
              <BookingForm
                id={modalSelectedId}
                onCancel={() => this.onModalClose()}
                onSave={() => {
                  this.onModalClose();
                  this.loadItems();
                }}
                readOnly
              />
            </>
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
                  start: 0, // reset pagination
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
