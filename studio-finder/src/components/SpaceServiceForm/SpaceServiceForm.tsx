import React from 'react';
import {
  IonLabel, IonList, IonItem, IonSelectOption, IonSelect, IonButton, IonButtons, IonIcon, IonToolbar,
  IonTitle, IonInput,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { trashOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { spaceServiceRequiredFields, SpaceService } from '../../services/api/spaceServices';
import { Service } from '../../services/api/services';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './SpaceServiceForm.css';

interface Props {
  index: number,
  item: SpaceService,
  disabled: boolean,
  onDelete: () => void,
  onChange: (item: SpaceService) => void,
  isUniqueTitle: (item: SpaceService) => boolean,
}

class SpaceServiceForm extends React.Component<Props> {
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
    const isRequired = required || spaceServiceRequiredFields.includes(fieldName as keyof SpaceService);
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

  renderNumericInput = ({
    value, disabled = false, required = false, label, fieldName, max, min, step = 1,
  }: {
    value: number, disabled?: boolean, required?: boolean, label: string, fieldName: string, max?: number, min?: number, step?: number,
  }) => {
    const isRequired = required || spaceServiceRequiredFields.includes(fieldName as keyof SpaceService);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonInput
          value={value}
          type="number"
          inputmode="decimal"
          min={typeof min === 'number' ? String(min) : undefined}
          max={typeof max === 'number' ? String(max) : undefined}
          step={typeof step === 'number' ? String(step) : undefined}
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => this.onChange(e.detail.value, fieldName)}
        />
      </>
    );
  }

  renderSelectInput = ({
    value, disabled = false, required = false, label, fieldName, options, headerLabel, onChange,
  }: {
    value: any, disabled?: boolean, required?: boolean, label: string, fieldName: string,
    options: { value: any, label: string }[], headerLabel?: string, onChange?: (value: any) => void,
  }) => {
    const isRequired = required || spaceServiceRequiredFields.includes(fieldName as keyof SpaceService);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonSelect
          value={value}
          // required={isRequired}
          disabled={disabled}
          interfaceOptions={{
            header: headerLabel || label,
          }}
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
    const { item, isUniqueTitle } = this.props;
    const { state } = this.context;
    const serviceTypeOptions = (state.services || []).map((service: Service) => ({
      value: service.type,
      label: service.title,
    }));
    return (
      <IonList className="form-list">
        <IonItem className="form-list-item">
          {this.renderSelectInput({
            value: item.serviceType,
            fieldName: 'serviceType',
            label: i18n.t('Service Type'),
            headerLabel: i18n.t('Select Service Type'),
            disabled,
            options: serviceTypeOptions,
            onChange: (value) => {
              this.onChange(value, 'serviceType');
              // update title manually
              const serviceType = serviceTypeOptions.find((sItem: any) => sItem.value === value);
              this.onChange(serviceType?.label || '', 'title');
            },
          })}
        </IonItem>
        <IonItem className="form-list-item">
          {this.renderTextInput({
            value: item.title,
            fieldName: 'title',
            label: i18n.t('Title'),
            disabled,
          })}
        </IonItem>
        {!isUniqueTitle(item) && (
          <Notification
            type={NotificationType.danger}
            className="space-service-form-notification form-list-item-full space-service-form-spacer"
            header={i18n.t('Invalid title')}
            message={i18n.t('Title must be unique')}
            preventDismiss
          />
        )}
        <IonItem className="form-list-item">
          {this.renderNumericInput({
            value: item.price,
            fieldName: 'price',
            label: i18n.t('Price'),
            min: 0,
            disabled,
          })}
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { disabled, index, onDelete } = this.props;
    return (
      <fieldset className="space-service-form-fieldset" disabled={disabled}>
        <IonToolbar className="space-service-form-toolbar">
          <IonTitle size="small" className="space-service-form-title">
            {`${i18n.t('Item')} #${index + 1}`}
          </IonTitle>
          <IonButtons slot="end">
            {!disabled && (
              <IonButton
                size="small"
                color="danger"
                fill="clear"
                title={i18n.t('Delete Item')}
                onClick={() => onDelete()}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
        {this.renderFields(disabled)}
      </fieldset>
    );
  }
}

SpaceServiceForm.contextType = AppContext;

export default SpaceServiceForm;
