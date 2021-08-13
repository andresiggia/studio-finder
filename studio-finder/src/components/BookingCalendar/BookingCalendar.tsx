import React from 'react';
import {
  IonButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner, IonTitle, IonToolbar, IonGrid,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  addOutline, chevronBackOutline, chevronForwardOutline, closeOutline,
} from 'ionicons/icons';

// services
import { SpaceProfile } from '../../services/api/spaces';
import i18n from '../../services/i18n/i18n';
import { BookingItemWithBooking, getBookingItems } from '../../services/api/bookingItems';
import { pad } from '../../services/helpers/misc';
import { StudioProfile } from '../../services/api/studios';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingForm from '../BookingForm/BookingForm';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingCalendar.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: BookingItemWithBooking[] | null,
  showModal: boolean,
  modalSelectedId: number,
  weekOffset: number,
}

interface Props {
  spaceProfile: SpaceProfile,
  studioProfile: StudioProfile,
}

class BookingCalendar extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      showModal: false,
      modalSelectedId: 0,
      weekOffset: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceProfile, studioProfile } = this.props;
    if (prevProps.spaceProfile.id !== spaceProfile.id
      || prevProps.studioProfile.id !== studioProfile.id) {
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
        const { spaceProfile } = this.props;
        // eslint-disable-next-line no-console
        console.log('will load bookings for space', spaceProfile);
        const items = await getBookingItems(this.context, {
          spaceId: spaceProfile.id,
          includeBookingAndUser: true,
        });
        // eslint-disable-next-line no-console
        console.log('got booking items', items);
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

  onModalOpen = (modalSelectedId = 0) => {
    this.setMountedState({
      showModal: true,
      modalSelectedId,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModal: false,
      modalSelectedId: 0,
    });
  }

  // render

  renderModal = () => {
    const { spaceProfile, studioProfile } = this.props;
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
        cssClass="booking-calendar-modal"
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {modalSelectedId
              ? i18n.t('Edit Booking')
              : i18n.t('Create Booking')}
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
            <IonGrid>
              <BookingForm
                id={modalSelectedId}
                spaceProfile={spaceProfile}
                studioProfile={studioProfile}
                onCancel={() => this.onModalClose()}
                onSave={() => {
                  this.onModalClose();
                  this.loadItems();
                }}
              />
            </IonGrid>
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderCalendar = () => {
    const { items, modalSelectedId, weekOffset } = this.state;
    const weekdays = Array.from(Array(7)).map((_item, index) => index);
    const now = new Date();
    const currentWeekday = now.getDay();
    const weekStartsAt = new Date(now.getTime());
    weekStartsAt.setDate(weekStartsAt.getDate() - currentWeekday + (weekOffset * 7));
    const halfTimes = Array.from(Array(24 * 2)).map((_item, index) => index / 2);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      <div className="booking-calendar-container">
        <table className="booking-calendar">
          <thead>
            <tr>
              <td>
                {i18n.t('Time')}
              </td>
              {weekdays.map((weekday) => {
                const date = new Date(weekStartsAt.getTime());
                date.setDate(date.getDate() + weekday);
                date.setHours(0, 0, 0, 0);
                return (
                  <td
                    key={weekday}
                    className={date.getTime() === today.getTime()
                      ? 'booking-calendar-item-header-active'
                      : ''}
                  >
                    {date.toLocaleDateString()}
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {halfTimes.map((time) => {
              const timeArr = String(time).split('.');
              const hours = Number(timeArr[0]);
              const minutes = (Number(timeArr[1] || 0) / 10) * 60;
              return (
                <tr key={time}>
                  <td>
                    <p>{`${pad(hours, 2)}:${pad(minutes, 2)}`}</p>
                  </td>
                  {weekdays.map((weekday) => {
                    const date = new Date(weekStartsAt.getTime());
                    date.setDate(date.getDate() + weekday);
                    date.setHours(hours, minutes, 0, 0);
                    const relevantItems = (items || []).filter((item) => {
                      if (!item.startAt || !item.endAt) {
                        return false;
                      }
                      const currentTimestamp = date.getTime();
                      const startAtTimestamp = item.startAt.getTime();
                      const endAtTimestamp = item.endAt.getTime();
                      return startAtTimestamp <= currentTimestamp && endAtTimestamp > currentTimestamp;
                    });
                    return (
                      <td key={weekday}>
                        {relevantItems.map((item) => {
                          let label = item.serviceTitle;
                          if (item.userId) {
                            const userNameSurname = `${item.userName} ${item.userSurname}`.trim();
                            label = `${userNameSurname} (${label})`;
                          }
                          return (
                            <IonButton
                              key={item.id}
                              fill={modalSelectedId === item.id
                                ? 'solid'
                                : 'clear'}
                              color="primary"
                              size="small"
                              expand="block"
                              title={i18n.t('View booking')}
                              // important: select booking id, not booking item id
                              onClick={() => this.onModalOpen(item.bookingId)}
                            >
                              {label}
                            </IonButton>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderContent = () => {
    const { isLoading, error } = this.state;

    if (isLoading) {
      return (
        <div className="booking-calendar-list-loading booking-calendar-list-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-calendar-list-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }

    return this.renderCalendar();
  }

  render() {
    const { weekOffset } = this.state;
    return (
      <>
        <IonToolbar>
          <IonTitle size="small" className="booking-calendar-list-title">
            {i18n.t('Booking Weekly Calendar')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              fill="clear"
              onClick={() => this.setMountedState({ weekOffset: weekOffset - 1 })}
            >
              <IonIcon icon={chevronBackOutline} ariaLabel={i18n.t('Previous Week')} />
            </IonButton>
            <IonButton
              color="primary"
              fill="solid"
              disabled={weekOffset === 0}
              onClick={() => this.setMountedState({ weekOffset: 0 })}
            >
              {i18n.t('This Week')}
            </IonButton>
            <IonButton
              color="primary"
              fill="clear"
              onClick={() => this.setMountedState({ weekOffset: weekOffset + 1 })}
            >
              <IonIcon icon={chevronForwardOutline} ariaLabel={i18n.t('Next Week')} />
            </IonButton>
            <IonButton
              color="primary"
              fill="clear"
              onClick={() => this.onModalOpen()}
            >
              <IonIcon slot="start" icon={addOutline} ariaLabel={i18n.t('Add Booking')} />
              {i18n.t('Booking')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {this.renderContent()}
        {this.renderModal()}
      </>
    );
  }
}

BookingCalendar.contextType = AppContext;

export default BookingCalendar;
