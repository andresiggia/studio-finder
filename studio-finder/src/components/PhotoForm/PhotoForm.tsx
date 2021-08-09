import React from 'react';
import {
  IonLabel, IonList, IonInput, IonItem, IonSelectOption, IonSelect, IonButton, IonButtons, IonIcon,
  IonToolbar, IonTitle, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { trashOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';

// constants
import { Photo, photoRequiredFields } from '../../services/api/photos';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './PhotoForm.css';
import ImageInput from '../ImageInput/ImageInput';

interface Props {
  index: number,
  count: number,
  item: Photo,
  file: File | null,
  disabled: boolean,
  onDelete: () => void,
  onChange: (item: Photo) => void,
  onFilesChange: (file: (File | null)[]) => void,
}

interface State {
  file: File | null,
  isLoading: boolean,
  error: Error | null,
}

class PhotoForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      file: null,
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
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

  renderSelectInput = ({
    value, disabled = false, required = false, label, fieldName, options, onChange,
  }: {
    value: any, disabled?: boolean, required?: boolean, label: string, fieldName: string,
    options: { value: any, label: string }[], onChange?: (value: any) => void,
  }) => {
    const isRequired = required || photoRequiredFields.includes(fieldName as keyof Photo);
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
    const { item, count, onFilesChange } = this.props;
    const { file } = this.state;
    const orderOptions = Array.from(Array(count)).map((_item, index) => ({
      value: index,
      label: String(index + 1),
    }));
    return (
      <IonList className="photo-form-list">
        <IonItem className="photo-form-list-item">
          {this.renderSelectInput({
            value: item.order,
            fieldName: 'order',
            label: i18n.t('Order'),
            disabled,
            options: orderOptions,
            onChange: (value) => this.onChange(value, 'order'),
          })}
        </IonItem>
        <IonItem>
          {this.renderLabel(i18n.t('Photo'))}
          <ImageInput
            files={file ? [file] : []}
            imageUrls={item.photoUrl ? [item.photoUrl] : []}
            renderImage={(url: string) => (
              <img src={url} alt="" />
            )}
            onFilesChange={onFilesChange}
            onImageUrlsChange={(imageUrls: string[]) => this.setMountedState({
              userProfile: {
                ...item,
                photoUrl: imageUrls.length > 0
                  ? imageUrls[0]
                  : '',
              },
            })}
          />
        </IonItem>
      </IonList>
    );
  }

  render() {
    const {
      disabled: parentDisabled, index, onDelete,
    } = this.props;
    const { isLoading, error } = this.state;
    const disabled = parentDisabled || isLoading || !!error;
    return (
      <fieldset className="photo-form-fieldset" disabled={disabled}>
        <IonToolbar className="photo-form-toolbar">
          <IonTitle size="small" className="photo-form-title">
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
        {isLoading && (
          <div className="photo-form-loading photo-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="photo-form-notification photo-form-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {this.renderFields(disabled)}
      </fieldset>
    );
  }
}

PhotoForm.contextType = AppContext;

export default PhotoForm;
