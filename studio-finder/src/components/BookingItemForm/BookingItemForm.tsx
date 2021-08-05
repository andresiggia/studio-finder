import React from 'react';
import {
  IonLabel, IonList, IonInput, IonItem, IonTextarea, IonSelectOption, IonSelect, IonButton, IonButtons, IonIcon,
  IonToolbar, IonTitle,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { trashOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';

// constants
import { BookingItemWithBooking } from '../../services/api/bookings';
import { StudioProfile } from '../../services/api/studios';
import { SpaceProfile } from '../../services/api/spaces';
import { Service } from '../../services/api/services';

// css
import './BookingItemForm.css';

interface Props {
  index: number,
  item: BookingItemWithBooking,
  disabled: boolean,
  studioProfile: StudioProfile,
  spaceProfile: SpaceProfile,
  onDelete: () => void,
  onChange: (item: BookingItemWithBooking) => void,
}

class BookingItemForm extends React.Component<Props> {
  requiredFields = ['spaceId', 'serviceType']

  isEditing = () => {
    const { item } = this.props;
    return !!item.id;
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
          onIonChange={(e: any) => this.onChange(e.detail.value, fieldName)}
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
          onIonChange={(e: any) => this.onChange(e.detail.value, fieldName)}
        />
      </>
    );
  }

  renderSelectInput = ({
    value, disabled = false, required = false, label, fieldName, options, onChange,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
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

  render() {
    const {
      spaceProfile, disabled, item, index, onDelete,
    } = this.props;
    const { state } = this.context;
    const serviceTypeOptions = (state.services || []).map((service: Service) => ({
      value: service.type,
      label: service.title,
    }));
    return (
      <div className="booking-item-form">
        <IonToolbar className="booking-item-form-toolbar">
          <IonTitle size="small" className="booking-item-form-title">
            {`${i18n.t('Item')} #${index + 1}`}
          </IonTitle>
          <IonButtons slot="end">
            {!disabled && (
              <IonButton
                size="small"
                color="primary"
                fill="clear"
                title={i18n.t('Delete Item')}
                onClick={() => onDelete()}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
        <IonList className="booking-item-form-list">
          <IonItem>
            {this.renderTextInput({
              value: item.spaceTitle || spaceProfile.title,
              fieldName: 'space',
              label: i18n.t('Space'),
              disabled: true,
            })}
          </IonItem>
          <IonItem>
            {this.renderSelectInput({
              value: item.serviceType,
              fieldName: 'serviceType',
              label: i18n.t('Service Type'),
              disabled,
              options: serviceTypeOptions,
              onChange: (value) => {
                this.onChange(value, 'serviceType');
                // update service title manually
                const serviceType = serviceTypeOptions.find((sItem: any) => sItem.value === value);
                this.onChange(serviceType?.title || '', 'serviceTitle');
              },
            })}
          </IonItem>
        </IonList>
      </div>
    );
  }
}

BookingItemForm.contextType = AppContext;

export default BookingItemForm;
