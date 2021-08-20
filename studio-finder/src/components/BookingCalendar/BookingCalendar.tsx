import React from 'react';
import {
  IonButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner, IonTitle, IonToolbar, IonGrid, IonChip,
  IonSelect, IonSelectOption,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  addOutline, chevronBackOutline, chevronForwardOutline, closeOutline, closeCircle,
} from 'ionicons/icons';

// services
import { SpaceProfile } from '../../services/api/spaces';
import i18n from '../../services/i18n/i18n';
import { BookingDate, BookingItemWithBooking, getBookingItemsBySpace } from '../../services/api/bookingItems';
import { pad } from '../../services/helpers/misc';
import { StudioProfile } from '../../services/api/studios';
import { SpaceService } from '../../services/api/spaceServices';

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
  lastBookingDate: BookingDate | null,
}

interface Props {
  spaceProfile: SpaceProfile,
  studioProfile: StudioProfile,
  spaceServices: SpaceService[],
  showAddButton?: boolean,
  showPastWeeks?: boolean,
  showBookingDetails?: boolean,
  showOnlyActive?: boolean,
  maxHeight?: number,
  bookingDates?: BookingDate[],
  onSelectionChange?: (index: number, item?: BookingDate) => void,
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
      lastBookingDate: null,
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
        const { spaceProfile, showOnlyActive } = this.props;
        // eslint-disable-next-line no-console
        console.log('will load bookings for space', spaceProfile);
        const { weekStartsAt, weekEndsAt } = this.getDateRange();
        const items = await getBookingItemsBySpace(this.context, {
          spaceId: spaceProfile.id,
          inactive: showOnlyActive ? false : undefined,
          fromDate: weekStartsAt,
          toDate: weekEndsAt,
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

  getDateRange = () => {
    const { weekOffset } = this.state;
    const currentWeekday = (new Date()).getDay();
    const weekStartsAt = new Date();
    weekStartsAt.setDate(weekStartsAt.getDate() - currentWeekday + (weekOffset * 7));
    weekStartsAt.setHours(0, 0, 0, 0);
    const weekEndsAt = new Date(weekStartsAt.getTime());
    weekEndsAt.setDate(weekEndsAt.getDate() + 7);
    return {
      weekStartsAt, weekEndsAt,
    };
  }

  allowSelection = () => {
    const { bookingDates, onSelectionChange } = this.props;
    return !!bookingDates && typeof onSelectionChange === 'function';
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

  onChange = (index: number, item?: BookingDate) => {
    const { onSelectionChange } = this.props;
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(index, item);
      if (item) {
        this.setMountedState({ lastBookingDate: item });
      }
    }
  }

  getDefaultSpaceService = () => {
    const { spaceServices } = this.props;
    const { lastBookingDate } = this.state;
    let defaultSpaceService: SpaceService | null = null;
    if (spaceServices.length > 0) {
      // use first option available
      [defaultSpaceService] = spaceServices;
      if (lastBookingDate) { // use last updated value
        defaultSpaceService = spaceServices.find((sItem) => sItem.title === lastBookingDate.serviceTitle)
          || defaultSpaceService;
      }
    }
    return defaultSpaceService;
  }

  onWeekChange = (weekOffset = 0) => {
    this.setMountedState({
      weekOffset,
    }, () => this.loadItems());
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
              ? i18n.t('View/Modify Booking')
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

  renderDateSelection = (date: Date) => {
    const {
      bookingDates, spaceProfile, spaceServices, onSelectionChange,
    } = this.props;
    const defaultSpaceService = this.getDefaultSpaceService();
    if (!this.allowSelection()
      || typeof onSelectionChange !== 'function'
      || date.getTime() < (new Date()).getTime()
      || !defaultSpaceService) {
      return null;
    }
    const index = bookingDates ? bookingDates.findIndex((item) => item.date.getTime() === date.getTime()) : -1;
    const isSelected = this.allowSelection() && index > -1;
    if (bookingDates && isSelected) {
      const bookingDate = bookingDates[index];
      return (
        <div className="booking-calendar-service">
          <IonSelect
            color="primary"
            value={bookingDate.serviceTitle}
            onIonChange={(e: any) => {
              const spaceService = spaceServices.find((sItem) => sItem.title === e.detail.value);
              if (spaceService) {
                this.onChange(index, {
                  ...bookingDate,
                  serviceTitle: spaceService.title,
                  serviceType: spaceService.serviceType,
                  servicePrice: spaceService.price,
                });
              }
            }}
          >
            {spaceServices.map((item: SpaceService) => (
              <IonSelectOption key={item.title} value={item.title}>
                {item.title}
              </IonSelectOption>
            ))}
          </IonSelect>
          <IonIcon
            icon={closeCircle}
            color="light"
            style={{ cursor: 'pointer' }}
            onClick={() => this.onChange(index)}
          />
        </div>
      );
    }
    return (
      <IonButton
        fill="clear"
        color="medium"
        size="small"
        expand="block"
        title={i18n.t('Click to select')}
        onClick={() => this.onChange(index, {
          spaceId: spaceProfile.id,
          date,
          serviceTitle: defaultSpaceService.title,
          serviceType: defaultSpaceService.serviceType,
          servicePrice: defaultSpaceService.price,
        })}
      >
        {i18n.t('Available')}
      </IonButton>
    );
  }

  renderCalendar = () => {
    const { maxHeight = 200, showBookingDetails } = this.props;
    const { items, modalSelectedId } = this.state;
    const weekdays = Array.from(Array(7)).map((_item, index) => index);
    const { weekStartsAt } = this.getDateRange();
    const halfTimes = Array.from(Array(24 * 2)).map((_item, index) => index / 2);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekdayDate = new Intl.DateTimeFormat(i18n.languages, {
      weekday: 'short',
    });
    const shortDate = new Intl.DateTimeFormat(i18n.languages, {
      dateStyle: 'short',
    });
    const longDateTime = new Intl.DateTimeFormat(i18n.languages, {
      dateStyle: 'long',
      timeStyle: 'short',
    });
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
                    title={`${longDateTime.format(date)} ${date.getTime() === today.getTime()
                      ? `(${i18n.t('Today')})`
                      : ''
                    }`}
                  >
                    {weekdayDate.format(date)}
                    <br />
                    <span className="booking-calendar-item-detail">
                      {shortDate.format(date)}
                    </span>
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody style={{ maxHeight: `${maxHeight}px` }}>
            {halfTimes.map((time, index) => {
              const startTimeArr = String(time).split('.');
              const startHours = Number(startTimeArr[0]);
              const startMinutes = (Number(startTimeArr[1] || 0) / 10) * 60;
              const endTime = (index + 1) === halfTimes.length
                ? halfTimes[0]
                : halfTimes[index + 1];
              const endTimeArr = String(endTime).split('.');
              const endHours = Number(endTimeArr[0]);
              const endMinutes = (Number(endTimeArr[1] || 0) / 10) * 60;
              return (
                <tr key={time}>
                  <td>
                    <p>{`${pad(startHours, 2)}:${pad(startMinutes, 2)} - ${pad(endHours, 2)}:${pad(endMinutes, 2)}`}</p>
                  </td>
                  {weekdays.map((weekday) => {
                    const startDateTime = new Date(weekStartsAt.getTime());
                    startDateTime.setDate(startDateTime.getDate() + weekday);
                    startDateTime.setHours(startHours, startMinutes, 0, 0);
                    const cellStartTimestamp = startDateTime.getTime();
                    const relevantItems = (items || []).filter((item) => {
                      if (!item.startAt || !item.endAt) {
                        return false;
                      }
                      const startAtTimestamp = item.startAt.getTime();
                      const endAtTimestamp = item.endAt.getTime();
                      return (startAtTimestamp <= cellStartTimestamp
                        && endAtTimestamp > cellStartTimestamp);
                    });
                    const activeItems = relevantItems.filter((item) => !item.inactive);
                    return (
                      <td key={weekday} title={startDateTime.toString()}>
                        {showBookingDetails
                          ? (
                            <>
                              {activeItems.length > 1 && (
                                <IonChip color="danger">{i18n.t('Overbooking')}</IonChip>
                              )}
                              {relevantItems.map((item) => {
                                let label = item.inactive ? i18n.t('cancelled') : item.serviceTitle;
                                if (item.userId) {
                                  const userNameSurname = `${item.userName} ${item.userSurname}`.trim();
                                  label = `${userNameSurname} (${label})`;
                                }
                                return (
                                  <IonButton
                                    key={item.id}
                                    fill={(modalSelectedId === item.id) ? 'solid' : 'clear'}
                                    color={item.inactive ? 'medium' : 'primary'}
                                    size="small"
                                    expand="block"
                                    title={`${
                                      item.startAt ? longDateTime.format(item.startAt) : ''
                                    } / ${
                                      item.endAt ? longDateTime.format(item.endAt) : ''
                                    }`}
                                    // important: select booking id, not booking item id
                                    onClick={() => this.onModalOpen(item.bookingId)}
                                  >
                                    {label}
                                  </IonButton>
                                );
                              })}
                            </>
                          ) : relevantItems.length === 0 && (
                            this.renderDateSelection(startDateTime)
                          )}
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
        <div className="booking-calendar-loading booking-calendar-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-calendar-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }

    return this.renderCalendar();
  }

  render() {
    const { showAddButton, showPastWeeks } = this.props;
    const { weekOffset } = this.state;
    return (
      <>
        <IonToolbar>
          <IonTitle size="small" className="booking-calendar-title">
            {i18n.t('Booking Calendar - Weekly')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              fill="clear"
              disabled={!showPastWeeks && weekOffset === 0}
              onClick={() => this.onWeekChange(weekOffset - 1)}
            >
              <IonIcon icon={chevronBackOutline} ariaLabel={i18n.t('Previous Week')} />
            </IonButton>
            <IonButton
              color="primary"
              fill="solid"
              disabled={weekOffset === 0}
              onClick={() => this.onWeekChange()}
            >
              {i18n.t('This Week')}
            </IonButton>
            <IonButton
              color="primary"
              fill="clear"
              onClick={() => this.onWeekChange(weekOffset + 1)}
            >
              <IonIcon icon={chevronForwardOutline} ariaLabel={i18n.t('Next Week')} />
            </IonButton>
            {showAddButton && (
              <IonButton
                color="primary"
                fill="clear"
                onClick={() => this.onModalOpen()}
              >
                <IonIcon slot="start" icon={addOutline} ariaLabel={i18n.t('Add Booking')} />
                {i18n.t('Booking')}
              </IonButton>
            )}
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
