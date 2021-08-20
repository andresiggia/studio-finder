import React from 'react';
import {
  IonLabel, IonIcon, IonSpinner, IonButton, IonGrid, IonRow, IonCol, IonList, IonInput, IonItem, IonTextarea,
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
import {
  defaultStudioProfile, getStudio, setStudio, StudioProfile, studioRequiredFields,
} from '../../services/api/studios';
import {
  defaultStudioPhoto, deleteStudioPhoto, getStudioPhotos, StudioPhoto, studioPhotoRequiredFields, setStudioPhoto,
} from '../../services/api/studioPhotos';
import { Photo } from '../../services/api/photos';
import { Address } from '../../services/api/address';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import PhotoList from '../PhotoList/PhotoList';
import AddressInput from '../AddressInput/AddressInput';

// css
import './StudioForm.css';

interface Props {
  id: number,
  onCancel?: () => void,
  onSave: () => void,
}

interface State {
  isLoading: boolean,
  error: Error | null,
  // fields
  studioProfile: StudioProfile,
  studioProfileOriginal: StudioProfile,
  studioPhotos: StudioPhoto[],
  studioPhotosOriginal: StudioPhoto[],
  studioPhotoFiles: (File | null)[],
}

class StudioForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      studioProfile: defaultStudioProfile,
      studioProfileOriginal: defaultStudioProfile,
      studioPhotos: [],
      studioPhotosOriginal: [],
      studioPhotoFiles: [],
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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        let studioProfile = defaultStudioProfile; // new studio
        let studioPhotos: StudioPhoto[] = [];
        let studioPhotoFiles: (File | null)[] = [];
        const { id } = this.props;
        if (id) {
          // eslint-disable-next-line no-console
          console.log('loading studio data...', id);
          studioProfile = await getStudio(this.context, id);
          studioPhotos = await getStudioPhotos(this.context, { studioId: id });
          const {
            studioPhotos: updatedPhotos, studioPhotoFiles: updatedPhotoFiles,
          } = this.reorderPhotosAndFiles(studioPhotos);
          studioPhotoFiles = updatedPhotoFiles.slice();
          studioPhotos = updatedPhotos.slice();
        }
        this.setMountedState({
          isLoading: false,
          studioProfile,
          studioProfileOriginal: studioProfile,
          studioPhotos,
          studioPhotosOriginal: studioPhotos,
          studioPhotoFiles,
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
    const { studioProfileOriginal, studioPhotosOriginal } = this.state;
    this.setMountedState({
      studioProfile: studioProfileOriginal,
      studioPhotos: studioPhotosOriginal,
    });
  }

  hasFileChanges = () => {
    const { studioPhotoFiles } = this.state;
    return studioPhotoFiles.some((file) => !!file);
  }

  hasPhotoChanges = () => {
    const { studioPhotos, studioPhotosOriginal } = this.state;
    return studioPhotos.length !== studioPhotosOriginal.length
      || studioPhotos.some((studioPhoto, index) => !deepEqual(studioPhoto, studioPhotosOriginal[index]))
      || this.hasFileChanges();
  }

  hasProfileChanges = () => {
    const { studioProfile, studioProfileOriginal } = this.state;
    return !deepEqual(studioProfile, studioProfileOriginal);
  }

  hasChanges = () => this.hasProfileChanges() || this.hasPhotoChanges()

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
          studioProfile, studioPhotos, studioPhotoFiles, studioPhotosOriginal,
        } = this.state;
        let { id: studioId = 0 } = studioProfile;
        if (this.hasProfileChanges() || !this.isEditing()) {
          // eslint-disable-next-line no-console
          console.log('will insert/update studio', studioProfile);
          const data = await setStudio(this.context, studioProfile);
          // eslint-disable-next-line no-console
          console.log('got studio data', data);
          studioId = data.id;
        }
        if (this.hasPhotoChanges()) {
          // handle removed items
          const deleted = await Promise.all(studioPhotosOriginal.map((studioPhoto) => {
            const existingItem = studioPhotos?.find((item) => item.id === studioPhoto.id);
            if (existingItem) {
              // still there
              return Promise.resolve(null);
            }
            // deleted
            return deleteStudioPhoto(this.context, studioPhoto.id);
          }));
          // eslint-disable-next-line no-console
          console.log('deleted items', deleted);
          // handle new/updated items
          // eslint-disable-next-line no-console
          console.log('will insert/update studio photos', studioPhotos);
          await Promise.all(studioPhotos.map((studioPhoto, index) => {
            // eslint-disable-next-line no-console
            console.log('will insert/update studio photo', studioPhoto);
            return setStudioPhoto(this.context, {
              studioPhoto, studioId, file: studioPhotoFiles[index],
            });
          }));
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

  isValidForm = () => {
    const { studioProfile, studioPhotos, studioPhotoFiles } = this.state;
    return Object.keys(studioProfile).every((key: string) => (
      !studioRequiredFields.includes(key as keyof StudioProfile) || !!studioProfile[key as keyof StudioProfile]
    ))
      && studioPhotos.every((studioPhoto, index) => Object.keys(studioPhoto).every((key: string) => (
        !studioPhotoRequiredFields.includes(key as keyof StudioPhoto)
          || !!studioPhoto[key as keyof StudioPhoto]
          || !!studioPhotoFiles[index]
      )));
  }

  reorderPhotosAndFiles = (items: Photo[], studioPhotoFiles?: (File | null)[]) => {
    const updatedPhotoFiles = (studioPhotoFiles || Array.from(Array(items.length)).map(() => null)).slice();
    const updatedPhotos = items.map((item, index) => {
      const previousIndex = item.order;
      const updatedItem = { ...item };
      if (previousIndex !== index) {
        // update order
        updatedItem.order = index;
        // reorder files
        const [fileItem] = updatedPhotoFiles.splice(previousIndex, 1);
        updatedPhotoFiles.splice(index, 0, fileItem);
      }
      return updatedItem;
    }) as StudioPhoto[];
    return {
      studioPhotos: updatedPhotos,
      studioPhotoFiles: updatedPhotoFiles,
    };
  }

  onPhotoItemsChange = (studioPhotos: Photo[], files?: (File | null)[]) => {
    const { studioPhotoFiles } = this.state;
    const {
      studioPhotos: updatedItems, studioPhotoFiles: updatedPhotoFiles,
    } = this.reorderPhotosAndFiles(studioPhotos, studioPhotoFiles);
    // eslint-disable-next-line no-console
    console.log('reordered items', {
      studioPhotos: updatedItems, studioPhotoFiles: files || updatedPhotoFiles,
    });
    this.setMountedState({
      studioPhotos: updatedItems,
      studioPhotoFiles: files || updatedPhotoFiles,
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
    const { isLoading, error } = this.state;
    const isValidForm = this.isValidForm();
    const hasChanges = this.hasChanges();
    const disabled = isLoading || !!error;
    return (
      <div className="studio-form-footer">
        <p className="studio-form-footer-note-required">
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
          <div className="studio-form-loading studio-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="studio-form-notification studio-form-spacer"
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
  value: string, disabled ?: boolean, required ?: boolean, label: string, fieldName: keyof StudioProfile,
  }) => {
    const isRequired = required || studioRequiredFields.includes(fieldName);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonInput
          value={value}
          type="text"
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => {
            const { studioProfile } = this.state;
            this.setMountedState({
              studioProfile: {
                ...studioProfile,
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
    const isRequired = required || studioRequiredFields.includes(fieldName as keyof StudioProfile);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonTextarea
          value={value}
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => {
            const { studioProfile } = this.state;
            this.setMountedState({
              studioProfile: {
                ...studioProfile,
                [fieldName]: e.detail.value || '',
              },
            });
          }}
        />
      </>
    );
  }

  renderImageField = (disabled: boolean) => {
    const { studioProfile, studioPhotos, studioPhotoFiles } = this.state;
    return (
      <div className="studio-form-photo">
        <div className="studio-form-photo-label">
          {this.renderLabel(i18n.t('Photos'))}
        </div>
        <PhotoList
          items={studioPhotos.map((studioPhoto) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { studioId, ...photo } = studioPhoto;
            return photo;
          })}
          files={studioPhotoFiles}
          disabled={disabled}
          onAdd={() => {
            const updatedItems = studioPhotos.slice();
            const updatedFiles = studioPhotoFiles.slice();
            updatedItems.push({
              ...defaultStudioPhoto,
              order: updatedItems.length,
            });
            updatedFiles.push(null);
            this.onPhotoItemsChange(updatedItems, updatedFiles);
          }}
          onDelete={(index: number) => {
            const updatedItems = studioPhotos.slice();
            const updatedFiles = studioPhotoFiles.slice();
            updatedItems.splice(index, 1);
            updatedFiles.splice(index, 1);
            this.onPhotoItemsChange(updatedItems, updatedFiles);
          }}
          onOrderChange={this.onPhotoItemsChange}
          onChange={(item: Photo, index: number) => {
            const updatedItems = studioPhotos.slice();
            updatedItems[index] = {
              ...item,
              studioId: studioProfile.id,
            } as StudioPhoto;
            this.onPhotoItemsChange(updatedItems);
          }}
          onFileChange={(file: File | null, index: number) => {
            const updatedFiles = studioPhotoFiles.slice();
            updatedFiles[index] = file;
            // eslint-disable-next-line no-console
            console.log('will update files', updatedFiles, index);
            this.setMountedState({
              studioPhotoFiles: updatedFiles,
            });
          }}
        />
      </div>
    );
  }

  renderFields = (disabled: boolean) => {
    const { studioProfile } = this.state;
    return (
      <IonList className="studio-form-list form-list">
        <IonItem className="form-list-item-full">
          {this.renderTextInput({
            value: studioProfile.title,
            fieldName: 'title',
            label: i18n.t('Title'),
            disabled,
          })}
        </IonItem>
        <IonItem className="form-list-item-full">
          {this.renderLabel(i18n.t('Address'), true)}
          <AddressInput
            value={studioProfile.address}
            disabled={disabled}
            placeholder={i18n.t('Type a postcode or address')}
            onChange={(address: Address) => this.setMountedState({
              studioProfile: {
                ...studioProfile,
                ...address,
              },
            })}
          />
        </IonItem>
        <IonItem className="form-list-item-full">
          {this.renderTextareaInput({
            value: studioProfile.description,
            fieldName: 'description',
            label: i18n.t('Description'),
            disabled,
          })}
        </IonItem>
        <IonItem className="form-list-item-full">
          {this.renderImageField(disabled)}
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { isLoading, error } = this.state;
    const disabled = isLoading || !!error;
    return (
      <form className="studio-form" onSubmit={this.onSubmit}>
        <fieldset className="studio-form-fieldset" disabled={disabled}>
          {this.renderFields(disabled)}
          {this.renderFooter()}
        </fieldset>
      </form>
    );
  }
}

StudioForm.contextType = AppContext;

export default StudioForm;
