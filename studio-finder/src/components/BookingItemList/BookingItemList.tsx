import React from 'react';
import {
  IonButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, closeOutline } from 'ionicons/icons';

// services
import { SpaceProfile } from '../../services/api/spaces';
import i18n from '../../services/i18n/i18n';
import { BookingItem, getBookingItems } from '../../services/api/bookings';
import { pad } from '../../services/helpers/misc';

// components
import Notification, { NotificationType } from '../Notification/Notification';
// import BookingItemForm from '../BookingItemForm/BookingItemForm';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingItemList.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: BookingItem[] | null,
  showModal: boolean,
  modalSelectedId: number,
}

interface Props {
  spaceProfile: SpaceProfile,
}

class BookingItemList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      showModal: false,
      modalSelectedId: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceProfile } = this.props;
    if (prevProps.spaceProfile.id !== spaceProfile.id) {
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
    });
  }

  // render

  renderModal = () => {
    // const { spaceProfile } = this.props;
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
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
            <p>Under development</p>
            // <BookingForm
            //   id={modalSelectedId}
            //   spaceProfile={spaceProfile}
            //   onCancel={() => this.onModalClose()}
            //   onSave={() => {
            //     this.onModalClose();
            //     this.loadItems();
            //   }}
            // />
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderCalendar = () => {
    const { items } = this.state;
    const weekdays = Array.from(Array(7)).map((_item, index) => index);
    const now = new Date();
    const currentWeekday = now.getDay();
    const weekStartsAt = new Date(now.getTime());
    weekStartsAt.setDate(weekStartsAt.getDate() - currentWeekday);
    const halfTimes = Array.from(Array(24 * 2)).map((_item, index) => index / 2);
    return (
      <div className="booking-item-calendar-container">
        <table className="booking-item-calendar">
          <thead>
            <tr>
              <td>
                {i18n.t('Time')}
              </td>
              {weekdays.map((weekday) => {
                const date = new Date(weekStartsAt.getTime());
                date.setDate(date.getDate() + weekday);
                return (
                  <td key={weekday}>
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
                        {relevantItems.map((item) => (
                          <p key={item.id}>
                            {item.serviceTitle}
                          </p>
                        ))}
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
        <div className="booking-item-list-loading booking-item-list-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-item-list-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }

    return this.renderCalendar();
  }

  render() {
    return (
      <>
        <IonToolbar>
          <IonTitle size="small" className="booking-item-list-title">
            {i18n.t('Booking Calendar')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              fill="clear"
              onClick={() => this.onModalOpen()}
            >
              <IonIcon icon={addOutline} ariaLabel={i18n.t('Add Booking')} />
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

BookingItemList.contextType = AppContext;

export default BookingItemList;
