import React from 'react';
import {
  IonLabel, IonIcon, IonSpinner, IonButton, IonGrid, IonRow, IonCol, IonList, IonInput, IonItem,
  IonTextarea, IonSelectOption, IonSelect,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  refreshOutline, saveOutline,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { deepEqual } from '../../services/helpers/misc';

// constants
import {
  defaultBookingWithUser, getBooking, upsertBooking, Booking, BookingWithUser,
  BookingItem, getBookingItems, upsertBookingItem, deleteBookingItem,
} from '../../services/api/bookings';
import { StudioProfile } from '../../services/api/studios';
import { SpaceProfile } from '../../services/api/spaces';

// components
import Notification, { NotificationType } from '../Notification/Notification';

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
  isLoading: boolean,
  error: Error | null,
  // fields
  booking: BookingWithUser | null,
  bookingOriginal: BookingWithUser | null,
  bookingItems: BookingItem[] | null,
  bookingItemsOriginal: BookingItem[] | null,
}

class BookingForm extends React.Component<Props, State> {
  mounted = false

  requiredFields = ['studioId']

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      booking: null,
      bookingOriginal: null,
      bookingItems: [],
      bookingItemsOriginal: null,
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
        let bookingItems: BookingItem[] = [];
        const { id } = this.props;
        if (id) {
          // eslint-disable-next-line no-console
          console.log('loading booking data...', id);
          [booking, bookingItems] = await Promise.all([
            getBooking(this.context, {
              bookingId: id,
              includeUser: true,
            }),
            getBookingItems(this.context, { bookingId: id }),
          ]);
        }
        this.setMountedState({
          isLoading: false,
          booking: booking || this.getDefaultBookingWithUser(),
          bookingOriginal: booking,
          bookingItems,
          bookingItemsOriginal: bookingItems,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
        throw error;
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

  hasChangesToBookingItem = (item: BookingItem, index: number) => {
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
        const { onSave, studioProfile, spaceProfile } = this.props;
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
          console.log('will insert/update booking', booking, 'in studio', studioProfile.id);
          const data = await upsertBooking(this.context, {
            booking, studioId: studioProfile.id,
          });
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
        const upserted = await Promise.all((bookingItems || []).map((bookingItem, i) => {
          if (!this.hasChangesToBookingItem(bookingItem, i)) {
            return Promise.resolve(null);
          }
          // eslint-disable-next-line no-console
          console.log('will insert/update booking item #', i, bookingItem, 'in space', spaceProfile.id);
          return upsertBookingItem(this.context, {
            bookingItem, spaceId: spaceProfile.id,
          });
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
    const { isLoading, error } = this.state;
    const isValidForm = this.isValidForm();
    const hasChanges = this.hasChanges();
    const disabled = isLoading || !!error;
    return (
      <div className="booking-form-footer">
        <p className="booking-form-footer-note-required">
          {`* ${i18n.t('Required')}`}
        </p>
        <IonGrid>
          <IonRow>
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
                    onClick={() => onCancel()}
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
          </IonRow>
        </IonGrid>
        {isLoading && (
          <div className="booking-form-loading booking-form-bookingr">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="booking-form-notification booking-form-bookingr"
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

  renderTextareaInput = ({
    value, disabled = false, required = false, label, fieldName,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
  }) => {
    const isRequired = required || this.requiredFields.includes(fieldName);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonTextarea
          value={value}
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
    value, disabled = false, required = false, label, fieldName, options,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string, options: { value: any, label: string }[],
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
    const { booking, bookingItems } = this.state;
    if (!booking || !bookingItems) {
      return null;
    }
    return (
      <IonList className="booking-form-list">
        <IonItem>
          {this.renderTextInput({
            value: booking.studioTitle,
            fieldName: 'studio',
            label: i18n.t('Studio'),
            disabled: true,
          })}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: String(bookingItems.length || 0),
            fieldName: 'bookingItems',
            label: i18n.t('Items'),
            disabled: true,
          })}
        </IonItem>
        {/* <IonItem>
          {this.renderTextInput({
            value: booking.title,
            fieldName: 'title',
            label: i18n.t('Title'),
            disabled,
          })}
        </IonItem>
        <IonItem>
          {this.renderTextareaInput({
            value: booking.description,
            fieldName: 'description',
            label: i18n.t('Description'),
            disabled,
          })}
        </IonItem> */}
      </IonList>
    );
  }

  render() {
    const { isLoading, error } = this.state;
    const disabled = isLoading || !!error;
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
