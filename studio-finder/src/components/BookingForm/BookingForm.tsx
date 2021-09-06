import React from 'react';
import {
  IonLabel, IonIcon, IonSpinner, IonButton, IonGrid, IonRow, IonCol, IonList, IonInput, IonItem, IonSelect, IonSelectOption, IonTextarea,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  refreshOutline, saveOutline, createOutline,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { deepEqual, isValidDate } from '../../services/helpers/misc';

// constants
import {
  defaultBookingWithUser, getBooking, setBooking, Booking, BookingWithUser, bookingRequiredFields, defaultBooking,
} from '../../services/api/bookings';
import {
  BookingItemWithBooking, getBookingItemsByBooking, setBookingItem, deleteBookingItem, defaultBookingItem,
  BookingItem, bookingItemRequiredFields,
} from '../../services/api/bookingItems';
import { StudioProfile, getStudio } from '../../services/api/studios';
import { SpaceProfile } from '../../services/api/spaces';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingItemList from '../BookingItemList/BookingItemList';

// css
import './BookingForm.css';

interface Props {
  id: number,
  studioProfile?: StudioProfile,
  spaceProfile?: SpaceProfile,
  readOnly?: boolean,
  onCancel?: () => void,
  onSave: () => void,
}

interface State {
  allowEdit: boolean,
  isLoading: boolean,
  error: Error | null,
  // fields
  studioProfile: StudioProfile | null,
  booking: BookingWithUser | null,
  bookingOriginal: BookingWithUser | null,
  bookingItems: BookingItemWithBooking[] | null,
  bookingItemsOriginal: BookingItemWithBooking[] | null,
}

class BookingForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      allowEdit: false,
      isLoading: false,
      error: null,
      studioProfile: null,
      booking: null,
      bookingOriginal: null,
      bookingItems: [],
      bookingItemsOriginal: [],
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.loadData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  getDefaultBookingWithUser = (studioProfile?: StudioProfile): BookingWithUser => {
    const { state } = this.context;
    return {
      ...defaultBookingWithUser,
      studioId: studioProfile?.id || 0,
      studioTitle: studioProfile?.title || '',
      createdBy: state.user.id,
      createdByName: state.profile.name,
      createdBySurname: state.profile.surname,
    };
  }

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        let booking: any = null; // new booking
        let bookingItems: any[] = [];
        const isEditing = this.isEditing();
        let { studioProfile } = this.props;
        if (isEditing) {
          const { id } = this.props;
          // eslint-disable-next-line no-console
          console.log('loading booking data...', id);
          [booking, bookingItems] = await Promise.all([
            getBooking(this.context, {
              bookingId: id,
              includeUser: true,
            }),
            getBookingItemsByBooking(this.context, { bookingId: id }),
          ]);
          if (!studioProfile) {
            studioProfile = await getStudio(this.context, booking.studioId);
          }
        }
        // eslint-disable-next-line no-console
        const defaultItem = this.getDefaultBookingWithUser(studioProfile);
        this.setMountedState({
          isLoading: false,
          allowEdit: !isEditing, // if creating new, skip allowEdit
          studioProfile,
          booking: booking || defaultItem,
          bookingOriginal: booking || defaultItem,
          bookingItems,
          bookingItemsOriginal: bookingItems.slice(),
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

  onReset = () => {
    const { bookingOriginal, bookingItemsOriginal } = this.state;
    this.setMountedState({
      booking: bookingOriginal,
      bookingItems: bookingItemsOriginal,
    });
  }

  hasChangesToBooking = () => {
    const { booking, bookingOriginal } = this.state;
    const hasChangesToBooking = !deepEqual(booking, bookingOriginal);
    // eslint-disable-next-line no-console
    if (!hasChangesToBooking) console.log('has no changes to Booking');
    return hasChangesToBooking;
  }

  hasChangesToBookingItem = (item: BookingItemWithBooking, index: number) => {
    const { bookingItemsOriginal } = this.state;
    const itemOriginal = item.id
      ? bookingItemsOriginal?.find((oItem) => oItem.id === item.id)
      : (bookingItemsOriginal || [])[index];
    const hasChangesToBookingItem = !deepEqual(item, itemOriginal);
    // eslint-disable-next-line no-console
    if (!hasChangesToBookingItem) console.log('has no changes to BookingItem', item);
    return hasChangesToBookingItem;
  }

  hasChangesToBookingItems = () => {
    const { bookingItems, bookingItemsOriginal } = this.state;
    const hasChangesToBookingItems = bookingItems?.length !== bookingItemsOriginal?.length
      || (bookingItems || []).some(this.hasChangesToBookingItem);
    // eslint-disable-next-line no-console
    if (!hasChangesToBookingItems) console.log('has no changes to BookingItems');
    return hasChangesToBookingItems;
  }

  hasChanges = () => this.hasChangesToBooking() || this.hasChangesToBookingItems()

  onSubmit = (e: any) => {
    // prevent form from submitting
    e.preventDefault();
    if (!this.isValidForm()) {
      // eslint-disable-next-line no-console
      console.warn('Invalid form');
      return;
    }
    if (!this.hasChanges()) {
      // eslint-disable-next-line no-console
      console.warn('Form has no changes');
      return;
    }
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { onSave } = this.props;
        const {
          studioProfile, booking: bookingWithUser, bookingItems, bookingItemsOriginal,
        } = this.state;
        if (!bookingWithUser) {
          throw new Error(i18n.t('Invalid booking'));
        }
        let { id: bookingId = 0 } = bookingWithUser;
        if (this.hasChangesToBooking() || !this.isEditing()) {
          // remove extra fields to convert BookingWithUser to Booking
          const booking: any = {};
          Object.keys(defaultBooking).forEach((key: string) => {
            booking[key] = bookingWithUser[key as keyof BookingWithUser];
          });
          // eslint-disable-next-line no-console
          console.log('will insert/update booking', booking);
          const data = await setBooking(this.context, {
            booking, studioId: studioProfile?.id || 0,
          });
          // eslint-disable-next-line no-console
          console.log('got new booking data', data);
          bookingId = data.id;
        }
        if (this.hasChangesToBookingItems()) {
          // handle removed items
          const deleted = await Promise.all((bookingItemsOriginal || []).map((bookingItem) => {
            const existingItem = bookingItems?.find((item) => item.id === bookingItem.id);
            if (existingItem) {
              // still there
              return Promise.resolve(null);
            }
            // deleted
            return deleteBookingItem(this.context, bookingItem.id);
          }));
          // eslint-disable-next-line no-console
          console.log('deleted items', deleted);
          // handle new/updated items
          const upserted = await Promise.all((bookingItems || []).map((bookingItemWithBooking, i) => {
            if (!this.hasChangesToBookingItem(bookingItemWithBooking, i)) {
              return Promise.resolve(null);
            }
            // remove extra fields to convert BookingItemWithBooking to BookingItem
            const bookingItem: any = {};
            Object.keys(defaultBookingItem).forEach((key: string) => {
              bookingItem[key] = bookingItemWithBooking[key as keyof BookingItemWithBooking];
            });
            // eslint-disable-next-line no-console
            console.log('will insert/update booking item #', i, bookingItem, bookingId);
            return setBookingItem(this.context, {
              bookingItem, bookingId,
            });
          }));
          // eslint-disable-next-line no-console
          console.log('inserted/updated items', upserted);
        }
        this.setMountedState({
          isLoading: false,
        }, () => onSave());
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - onSubmit', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  isEditing = () => {
    const { id } = this.props;
    return !!id;
  }

  isValidEndDate = (item: BookingItemWithBooking) => {
    const { startAt, endAt } = item;
    if (!isValidDate(startAt) || !isValidDate(endAt)) {
      return true; // ignore when dates are not set
    }
    const isValidEndDate = startAt.getTime() < endAt.getTime();
    // eslint-disable-next-line no-console
    if (!isValidEndDate) console.log('invalid endDate');
    return isValidEndDate;
  }

  isValidBooking = () => {
    const { booking } = this.state;
    const isValidBooking = !!booking && Object.keys(booking).every((key: string) => (
      !bookingRequiredFields.includes(key as keyof Booking) || !!booking[key as keyof Booking]
    ));
    // eslint-disable-next-line no-console
    if (!isValidBooking) console.log('invalid booking', booking);
    return isValidBooking;
  }

  isValidBookingItems = () => {
    const { bookingItems } = this.state;
    // at least one booking item is required
    const isValidBookingItems = !!bookingItems && bookingItems?.length > 0
      && bookingItems.every((bookingItem) => Object.keys(bookingItem).every((key: string) => (
        !bookingItemRequiredFields.includes(key as keyof BookingItem) || !!bookingItem[key as keyof BookingItem]
      )) && this.isValidEndDate(bookingItem));
    // eslint-disable-next-line no-console
    if (!isValidBookingItems) console.log('invalid booking items');
    return isValidBookingItems;
  }

  isValidForm = () => this.isValidBooking() && this.isValidBookingItems()

  onItemAdd = () => {
    const { spaceProfile } = this.props;
    const { studioProfile, booking, bookingItems } = this.state;
    const { state } = this.context;
    const updatedItems = (bookingItems || []).slice();
    updatedItems.push({
      ...defaultBookingItem,
      studioId: studioProfile?.id || 0,
      studioTitle: studioProfile?.title || '',
      userId: state.user.id,
      userName: state.user.name,
      userSurname: state.user.surname,
      createdBy: state.user.id,
      createdByName: state.user.name,
      createdBySurname: state.user.surname,
      modifiedBy: '',
      modifiedByName: '',
      modifiedBySurname: '',
      spaceTitle: spaceProfile?.title || '',
      // booking items
      bookingId: booking?.id || 0,
      spaceId: spaceProfile?.id || 0,
    });
    this.setMountedState({
      bookingItems: updatedItems,
    });
  }

  onItemDelete = (index: number) => {
    const { bookingItems } = this.state;
    const updatedItems = (bookingItems || []).slice();
    updatedItems.splice(index, 1);
    this.setMountedState({
      bookingItems: updatedItems,
    });
  }

  onItemChange = (item: BookingItemWithBooking, index: number) => {
    const { bookingItems } = this.state;
    const updatedItems = (bookingItems || []).map((oItem, i) => {
      if (index === i) {
        return item;
      }
      return oItem;
    });
    this.setMountedState({
      bookingItems: updatedItems,
    });
  }

  onChange = (value: any, fieldName: string, callback?: any) => {
    const { booking } = this.state;
    this.setMountedState({
      booking: {
        ...booking,
        [fieldName]: value,
      },
    }, callback);
  }

  // render

  renderLabel = (label: string, required = false) => (
    <IonLabel position="stacked">
      {`${label} ${required
        ? '*'
        : ''}`}
    </IonLabel>
  )

  renderFooter = () => {
    const { readOnly, onCancel } = this.props;
    const { isLoading, error, allowEdit } = this.state;
    const isValidForm = this.isValidForm();
    const hasChanges = this.hasChanges();
    const disabled = isLoading || !!error;
    return (
      <div className="booking-form-footer">
        {allowEdit && (
          <p className="booking-form-footer-note-required">
            {`* ${i18n.t('Required')}`}
          </p>
        )}
        {isLoading && (
          <div className="booking-form-loading booking-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="booking-form-notification booking-form-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {!isValidForm && (
          <Notification
            type={NotificationType.danger}
            className="booking-form-notification booking-form-spacer"
            header={i18n.t('Missing required fields')}
            message={i18n.t('Some required fields are missing or have invalid data')}
            preventDismiss
          />
        )}
        <IonGrid>
          <IonRow>
            {allowEdit
              ? (
                <>
                  <IonCol size="12" size-md="6">
                    {(hasChanges || typeof onCancel !== 'function')
                      ? (
                        <IonButton
                          fill="outline"
                          type="button"
                          expand="block"
                          disabled={disabled || !hasChanges}
                          onClick={() => this.onReset()}
                        >
                          <IonIcon slot="start" icon={refreshOutline} />
                          {i18n.t('Reset')}
                        </IonButton>
                      ) : (
                        <IonButton
                          fill="outline"
                          type="button"
                          expand="block"
                          disabled={disabled}
                          onClick={() => (this.isEditing()
                            ? this.setMountedState({ allowEdit: false })
                            : onCancel())}
                        >
                          {i18n.t('Cancel')}
                        </IonButton>
                      )}
                  </IonCol>
                  <IonCol size="12" size-md="6">
                    <IonButton
                      color="primary"
                      type="submit"
                      expand="block"
                      disabled={disabled || !isValidForm || !hasChanges}
                    >
                      <IonIcon slot="start" icon={saveOutline} />
                      {i18n.t('Save')}
                    </IonButton>
                  </IonCol>
                </>
              ) : (
                <>
                  <IonCol size="12" size-md="6">
                    {typeof onCancel === 'function' && (
                      <IonButton
                        fill="outline"
                        type="button"
                        expand="block"
                        onClick={() => onCancel()}
                      >
                        {i18n.t('Close')}
                      </IonButton>
                    )}
                  </IonCol>
                  <IonCol size="12" size-md="6">
                    <IonButton
                      color="primary"
                      expand="block"
                      disabled={readOnly}
                      onClick={() => this.setMountedState({ allowEdit: true })}
                    >
                      <IonIcon slot="start" icon={createOutline} />
                      {i18n.t('Edit')}
                    </IonButton>
                  </IonCol>
                </>
              )}
          </IonRow>
        </IonGrid>
      </div>
    );
  }

  renderTextInput = ({
    value, disabled = false, required = false, label, fieldName,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
  }) => {
    const isRequired = required || bookingRequiredFields.includes(fieldName as keyof Booking);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonInput
          value={value}
          type="text"
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => this.onChange(e.detail.value || '', fieldName)}
        />
      </>
    );
  }

  renderTextareaInput = ({
    value, disabled = false, required = false, label, fieldName,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
  }) => {
    const isRequired = required || bookingItemRequiredFields.includes(fieldName as keyof BookingItem);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonTextarea
          value={value}
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => this.onChange(e.detail.value || '', fieldName)}
        />
      </>
    );
  }

  renderSelectInput = ({
    value, disabled = false, required = false, label, fieldName, options,
  }: {
    value: any, disabled?: boolean, required?: boolean, label: string, fieldName: string,
    options: { value: any, label: string }[],
  }) => {
    const isRequired = required || bookingRequiredFields.includes(fieldName as keyof Booking);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonSelect
          value={value}
          // required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => this.onChange(e.detail.value || '', fieldName)}
        >
          {options.map((item) => (
            <IonSelectOption key={item.value} value={item.value}>
              {item.label}
            </IonSelectOption>
          ))}
        </IonSelect>
      </>
    );
  }

  renderFields = (disabled: boolean) => {
    const { studioProfile, booking, bookingItems } = this.state;
    if (!booking || !bookingItems) {
      return null;
    }
    if (!studioProfile) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-form-notification booking-form-spacer"
          header={i18n.t('Invalid studio')}
          message={i18n.t('Missing studio information')}
          preventDismiss
        />
      );
    }
    return (
      <IonList className="form-list booking-form-list">
        <IonItem className="form-list-item">
          {this.renderTextInput({
            value: studioProfile.title || '',
            fieldName: 'studio',
            label: i18n.t('Studio'),
            disabled: true,
          })}
        </IonItem>
        {booking.userId && (
          <IonItem className="form-list-item">
            {this.renderTextInput({
              value: `${booking.userName || ''} ${booking.userSurname || ''}`.trim() || booking.userId,
              fieldName: 'user',
              label: i18n.t('User'),
              disabled: true,
            })}
          </IonItem>
        )}
        {!!booking.createdBy && (
          <IonItem className="form-list-item">
            {this.renderTextInput({
              value: `${booking.createdByName || ''} ${booking.createdBySurname || ''}`.trim() || booking.createdBy,
              fieldName: 'createdBy',
              label: i18n.t('Created By'),
              disabled: true,
            })}
          </IonItem>
        )}
        {!!booking.modifiedBy && (
          <IonItem className="form-list-item">
            {this.renderTextInput({
              value: `${booking.modifiedByName || ''} ${booking.modifiedBySurname || ''}`.trim() || booking.modifiedBy,
              fieldName: 'modifiedBy',
              label: i18n.t('Modified By'),
              disabled: true,
            })}
          </IonItem>
        )}
        <IonItem className="form-list-item-full">
          {this.renderTextareaInput({
            value: booking.notes,
            fieldName: 'notes',
            label: i18n.t('Notes'),
            disabled,
          })}
        </IonItem>
        {studioProfile?.id && (
          <div className="form-list-item-full">
            <BookingItemList
              items={bookingItems}
              disabled={disabled}
              studioId={studioProfile.id}
              booking={booking}
              onAdd={this.onItemAdd}
              onDelete={this.onItemDelete}
              onChange={this.onItemChange}
              isValidEndDate={this.isValidEndDate}
            />
          </div>
        )}
      </IonList>
    );
  }

  render() {
    const { isLoading, error, allowEdit } = this.state;
    const disabled = isLoading || !!error || !allowEdit;
    return (
      <form className="booking-form" onSubmit={this.onSubmit}>
        <fieldset className="booking-form-fieldset" disabled={disabled}>
          {this.renderFields(disabled)}
          {this.renderFooter()}
        </fieldset>
      </form>
    );
  }
}

BookingForm.contextType = AppContext;

export default BookingForm;
