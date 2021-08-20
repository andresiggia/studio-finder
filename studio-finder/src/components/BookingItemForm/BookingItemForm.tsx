import React from 'react';
import {
  IonLabel, IonList, IonItem, IonTextarea, IonSelectOption, IonSelect, IonButton, IonButtons, IonIcon,
  IonToolbar, IonTitle, IonDatetime, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  trashOutline, refreshOutline,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { BookingItem, bookingItemRequiredFields, BookingItemWithBooking } from '../../services/api/bookingItems';
import { getSpacesByUser, SpaceProfile } from '../../services/api/spaces';
import { SpaceService } from '../../services/api/spaceServices';

// components
import Notification, { NotificationType } from '../Notification/Notification';

import BookingItemService from './BookingItemService';

// css
import './BookingItemForm.css';
import { isValidDate } from '../../services/helpers/misc';

interface Props {
  index: number,
  item: BookingItemWithBooking,
  disabled: boolean,
  studioId: number,
  onDelete: () => void,
  onChange: (item: BookingItemWithBooking) => void,
  isValidEndDate: (item: BookingItemWithBooking) => boolean,
}

interface State {
  spaces: SpaceProfile[] | null,
  isLoading: boolean,
  error: Error | null,
}

class BookingItemForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      spaces: null,
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { studioId } = this.props;
    if (prevProps.studioId !== studioId) {
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

  isEditing = () => {
    const { item } = this.props;
    return !!item.id;
  }

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { studioId } = this.props;
        // eslint-disable-next-line no-console
        console.log('loading spaces...');
        const spaces = await getSpacesByUser(this.context, {
          studioId,
        });
        // eslint-disable-next-line no-console
        console.log('got spaces', spaces);
        this.setMountedState({
          isLoading: false,
          spaces,
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

  onChange = (value: any, fieldName: string) => {
    const { item, onChange } = this.props;
    onChange({
      ...item,
      [fieldName]: value,
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

  renderDateTimeInput = ({
    value, disabled = false, required = false, label, fieldName, minDate, maxDate,
  }: {
      value: Date | null, disabled?: boolean, required?: boolean, label: string, fieldName: string,
      minDate?: Date | null, maxDate?: Date | null,
  }) => {
    const isRequired = required || bookingItemRequiredFields.includes(fieldName as keyof BookingItem);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonDatetime
          value={isValidDate(value)
            ? value.toISOString()
            : ''}
          displayFormat="D MMM YYYY, HH:mm"
          min={isValidDate(minDate)
            ? minDate.toISOString()
            : undefined}
          max={isValidDate(maxDate)
            ? maxDate.toISOString()
            : undefined}
          placeholder={i18n.t('Select')}
          // required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => this.onChange(new Date(e.detail.value), fieldName)}
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
          onIonChange={(e: any) => this.onChange(e.detail.value, fieldName)}
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
    const isRequired = required || bookingItemRequiredFields.includes(fieldName as keyof BookingItem);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonSelect
          value={value}
          // required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => (typeof onChange === 'function'
            ? onChange(e.detail.value)
            : this.onChange(e.detail.value, fieldName))}
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
    const { item, isValidEndDate } = this.props;
    const { spaces } = this.state;
    const spaceOptions = (spaces || []).map((space) => ({
      value: space.id,
      label: space.title,
    }));
    return (
      <IonList className="form-list">
        <IonItem className="form-list-item">
          {!!spaces && (
            this.renderSelectInput({
              value: item.spaceId,
              fieldName: 'spaceId',
              label: i18n.t('Space'),
              disabled,
              options: spaceOptions,
              onChange: (value) => {
                this.onChange(value, 'spaceId');
                // update space title manually
                const space = spaceOptions.find((sItem: any) => sItem.value === value);
                this.onChange(space?.label || '', 'spaceTitle');
              },
            })
          )}
        </IonItem>
        <IonItem className="form-list-item">
          {item.spaceId && (
            <BookingItemService
              spaceId={item.spaceId}
              render={(spaceServices: SpaceService[]) => (
                this.renderSelectInput({
                  value: item.serviceTitle,
                  fieldName: 'serviceTitle',
                  label: i18n.t('Service'),
                  disabled,
                  options: spaceServices.map((spaceService) => ({
                    value: spaceService.title, // title is unique per spaceId
                    label: spaceService.title,
                  })),
                  onChange: (title) => {
                    const spaceService = spaceServices.find((sItem: any) => sItem.title === title);
                    if (spaceService) {
                      this.onChange(title, 'serviceTitle');
                      this.onChange(spaceService.serviceType, 'serviceType');
                      this.onChange(spaceService.price, 'price');
                    }
                  },
                })
              )}
            />
          )}
        </IonItem>
        <IonItem className="form-list-item">
          {this.renderDateTimeInput({
            value: item.startAt,
            fieldName: 'startAt',
            label: i18n.t('Start At'),
            maxDate: item.endAt,
            disabled,
          })}
        </IonItem>
        <IonItem className="form-list-item">
          {this.renderDateTimeInput({
            value: item.endAt,
            fieldName: 'endAt',
            label: i18n.t('End At'),
            minDate: item.startAt,
            disabled,
          })}
        </IonItem>
        {!isValidEndDate(item) && (
          <Notification
            type={NotificationType.danger}
            className="booking-item-form-notification booking-item-form-spacer"
            header={i18n.t('Invalid end date')}
            message={i18n.t('End date/time must be after start date/time')}
            preventDismiss
          />
        )}
        <IonItem className="form-list-item-full">
          {this.renderTextareaInput({
            value: item.notes,
            fieldName: 'notes',
            label: i18n.t('Notes'),
            disabled,
          })}
        </IonItem>
      </IonList>
    );
  }

  render() {
    const {
      disabled: parentDisabled, index, item, onDelete,
    } = this.props;
    const { isLoading, error } = this.state;
    const disabled = parentDisabled || isLoading || !!error;
    return (
      <fieldset className="booking-item-form-fieldset" disabled={disabled}>
        <IonToolbar className="booking-item-form-toolbar">
          <IonTitle
            className="booking-item-form-title"
            size="small"
            color={item.inactive ? 'danger' : ''}
          >
            {`${i18n.t('Item')} #${index + 1} ${
              item.inactive ? `(${i18n.t('cancelled')})` : ''
            }`}
          </IonTitle>
          <IonButtons slot="end">
            {!disabled && (
              item.inactive
                ? (
                  <IonButton
                    size="small"
                    color="primary"
                    fill="clear"
                    title={i18n.t('Restore Item')}
                    onClick={() => this.onChange(false, 'inactive')}
                  >
                    <IonIcon icon={refreshOutline} />
                  </IonButton>
                ) : (
                  <IonButton
                    size="small"
                    color="danger"
                    fill="clear"
                    title={i18n.t('Delete Item')}
                    onClick={() => {
                      if (item.id) { // deactivate (existing item)
                        this.onChange(true, 'inactive');
                      } else { // delete (new item)
                        onDelete();
                      }
                    }}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                )
            )}
          </IonButtons>
        </IonToolbar>
        {isLoading && (
          <div className="booking-item-form-loading booking-item-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="booking-item-form-notification booking-item-form-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {this.renderFields(disabled || item.inactive)}
      </fieldset>
    );
  }
}

BookingItemForm.contextType = AppContext;

export default BookingItemForm;
