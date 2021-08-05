import React from 'react';
import {
  IonLabel, IonIcon, IonSpinner, IonButton, IonGrid, IonRow, IonCol, IonList, IonInput, IonItem, IonSelect, IonSelectOption,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  refreshOutline, saveOutline, createOutline,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { deepEqual } from '../../services/helpers/misc';

// constants
import {
  defaultBookingWithUser, getBooking, upsertBooking, Booking, BookingWithUser,
  BookingItemWithBooking, getBookingItems, upsertBookingItem, deleteBookingItem, defaultBookingItem,
} from '../../services/api/bookings';
import { getStudios, StudioProfile } from '../../services/api/studios';
import { SpaceProfile } from '../../services/api/spaces';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingItemList from '../BookingItemList/BookingItemList';

// css
import './BookingForm.css';

interface Props {
  id: number,
  studioProfile: StudioProfile,
  spaceProfile: SpaceProfile,
  onCancel?: () => void,
  onSave: () => void,
}

interface State {
  allowEdit: boolean,
  isLoading: boolean,
  error: Error | null,
  studios: StudioProfile[],
  // fields
  booking: BookingWithUser | null,
  bookingOriginal: BookingWithUser | null,
  bookingItems: BookingItemWithBooking[] | null,
  bookingItemsOriginal: BookingItemWithBooking[] | null,
}

class BookingForm extends React.Component<Props, State> {
  mounted = false

  requiredFields = ['studioId']

  constructor(props: Props) {
    super(props);
    this.state = {
      allowEdit: false,
      isLoading: false,
      error: null,
      studios: [],
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
    } else {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  getDefaultBookingWithUser = (props: Props = this.props): BookingWithUser => {
    const { studioProfile } = props;
    const { state } = this.context;
    return {
      ...defaultBookingWithUser,
      studioId: studioProfile.id,
      studioTitle: studioProfile.title,
      userId: state.user.id,
      userName: state.profile.name,
      userSurname: state.profile.surname,
      actTitle: '',
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
        if (isEditing) {
          const { id } = this.props;
          // eslint-disable-next-line no-console
          console.log('loading booking data...', id);
          [booking, bookingItems] = await Promise.all([
            getBooking(this.context, {
              bookingId: id,
              includeUser: true,
            }),
            getBookingItems(this.context, { bookingId: id, includeBookingAndUser: true }),
          ]);
        }
        // eslint-disable-next-line no-console
        console.log('loading studios...');
        const studios = await getStudios(this.context);
        const defaultBooking = this.getDefaultBookingWithUser();
        this.setMountedState({
          isLoading: false,
          allowEdit: !isEditing, // if creating new, skip allowEdit
          studios,
          booking: booking || defaultBooking,
          bookingOriginal: booking || defaultBooking,
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
    return !deepEqual(booking, bookingOriginal);
  }

  hasChangesToBookingItem = (item: BookingItemWithBooking, index: number) => {
    const { bookingItemsOriginal } = this.state;
    const itemOriginal = item.id
      ? bookingItemsOriginal?.find((oItem) => oItem.id === item.id)
      : (bookingItemsOriginal || [])[index];
    return !deepEqual(item, itemOriginal);
  }

  hasChangesToBookingItems = () => {
    const { bookingItems, bookingItemsOriginal } = this.state;
    return bookingItems?.length !== bookingItemsOriginal?.length
      || (bookingItems || []).some(this.hasChangesToBookingItem);
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
        const { booking: bookingWithUser, bookingItems, bookingItemsOriginal } = this.state;
        if (this.hasChangesToBooking()) {
          if (!bookingWithUser) {
            throw new Error(i18n.t('Invalid booking'));
          }
          // extract items to transform BookingWithUser into Booking type
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            studioTitle, userName, userSurname, actTitle, ...booking
          } = bookingWithUser;
          // eslint-disable-next-line no-console
          console.log('will insert/update booking', booking);
          const data = await upsertBooking(this.context, booking);
          // eslint-disable-next-line no-console
          console.log('got new booking data', data);
        }
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
          // extract items to transform BookingWithUser into Booking type
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            studioId, userId, actId, studioTitle, userName, userSurname, actTitle, ...bookingItem
          } = bookingItemWithBooking;
          // eslint-disable-next-line no-console
          console.log('will insert/update booking item #', i, bookingItem);
          return upsertBookingItem(this.context, bookingItem);
        }));
        // eslint-disable-next-line no-console
        console.log('inserted/updated items', upserted);
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

  isValidForm = () => {
    const { booking } = this.state;
    return !!booking && Object.keys(booking).every((key: string) => (
      !this.requiredFields.includes(key) || !!booking[key as keyof Booking]
    ));
  }

  onItemAdd = () => {
    const { studioProfile, spaceProfile } = this.props;
    const { booking, bookingItems } = this.state;
    const { state } = this.context;
    const updatedItems = (bookingItems || []).slice();
    updatedItems.push({
      ...defaultBookingItem,
      studioId: studioProfile.id,
      studioTitle: studioProfile.title,
      userId: state.user.id,
      userName: state.user.name,
      userSurname: state.user.surname,
      createdBy: state.user.id,
      createdByName: state.user.name,
      createdBySurname: state.user.surname,
      modifiedBy: '',
      modifiedByName: '',
      modifiedBySurname: '',
      actId: 0,
      actTitle: '',
      spaceTitle: spaceProfile.title,
      // booking items
      bookingId: booking?.id || 0,
      spaceId: spaceProfile.id,
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

  // render

  renderLabel = (label: string, required = false) => (
    <IonLabel position="stacked">
      {`${label} ${required
        ? '*'
        : ''}`}
    </IonLabel>
  )

  renderFooter = () => {
    const { onCancel } = this.props;
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
      </div>
    );
  }

  renderTextInput = ({
    value, disabled = false, required = false, label, fieldName,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
  }) => {
    const isRequired = required || this.requiredFields.includes(fieldName);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonInput
          value={value}
          type="text"
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => {
            const { booking } = this.state;
            this.setMountedState({
              booking: {
                ...booking,
                [fieldName]: e.detail.value || '',
              },
            });
          }}
        />
      </>
    );
  }

  renderSelectInput = ({
    value, disabled = false, required = false, label, fieldName, options, onChange,
  }: {
    value: any, disabled?: boolean, required?: boolean, label: string, fieldName: string,
    options: { value: any, label: string }[], onChange?: (value: any) => void,
  }) => {
    const isRequired = required || this.requiredFields.includes(fieldName);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonSelect
          value={value}
          // required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => {
            const { booking } = this.state;
            this.setMountedState({
              booking: {
                ...booking,
                [fieldName]: e.detail.value || '',
              },
            });
          }}
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
    const { spaceProfile, studioProfile } = this.props;
    const { booking, bookingItems, studios } = this.state;
    if (!booking || !bookingItems) {
      return null;
    }
    return (
      <IonList className="booking-form-list">
        <IonItem className="booking-form-list-item">
          {this.renderSelectInput({
            value: booking.studioId,
            fieldName: 'studio',
            label: i18n.t('Studio'),
            disabled,
            options: studios.map((item) => ({
              value: item.id,
              label: item.title,
            })),
          })}
        </IonItem>
        {booking.userId && (
          <IonItem className="booking-form-list-item">
            {this.renderTextInput({
              value: `${booking.userName || ''} ${booking.userSurname || ''}`.trim() || booking.userId,
              fieldName: 'user',
              label: i18n.t('User'),
              disabled: true,
            })}
          </IonItem>
        )}
        {booking.actId && (
          <IonItem className="booking-form-list-item">
            {this.renderTextInput({
              value: booking.actTitle || String(booking.actId),
              fieldName: 'act',
              label: i18n.t('Act'),
              disabled: true,
            })}
          </IonItem>
        )}
        {!!booking.createdBy && (
          <IonItem className="booking-form-list-item">
            {this.renderTextInput({
              value: `${booking.createdByName || ''} ${booking.createdBySurname || ''}`.trim() || booking.createdBy,
              fieldName: 'createdBy',
              label: i18n.t('Created By'),
              disabled: true,
            })}
          </IonItem>
        )}
        {!!booking.modifiedBy && (
          <IonItem className="booking-form-list-item">
            {this.renderTextInput({
              value: `${booking.modifiedByName || ''} ${booking.modifiedBySurname || ''}`.trim() || booking.modifiedBy,
              fieldName: 'modifiedBy',
              label: i18n.t('Modified By'),
              disabled: true,
            })}
          </IonItem>
        )}
        <div className="booking-form-list-items">
          <BookingItemList
            items={bookingItems}
            disabled={disabled}
            spaceProfile={spaceProfile}
            studioProfile={studioProfile}
            booking={booking}
            onAdd={this.onItemAdd}
            onDelete={this.onItemDelete}
            onChange={this.onItemChange}
          />
        </div>
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
