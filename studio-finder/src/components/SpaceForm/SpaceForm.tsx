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
  defaultSpaceProfile, getSpace, setSpace, SpaceProfile, spaceRequiredFields,
} from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';
import {
  defaultSpacePhoto, deleteSpacePhoto, getSpacePhotos, SpacePhoto, spacePhotoRequiredFields, setSpacePhoto,
} from '../../services/api/spacePhotos';
import { Photo } from '../../services/api/photos';
import {
  defaultSpaceService, deleteSpaceService, getSpaceServices, SpaceService, spaceServiceRequiredFields, setSpaceService,
} from '../../services/api/spaceServices';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import PhotoList from '../PhotoList/PhotoList';
import SpaceServiceList from '../SpaceServiceList/SpaceServiceList';

// css
import './SpaceForm.css';

interface Props {
  id: number,
  studioProfile: StudioProfile,
  onCancel?: () => void,
  onSave: () => void,
}

interface State {
  isLoading: boolean,
  error: Error | null,
  // fields
  spaceProfile: SpaceProfile,
  spaceProfileOriginal: SpaceProfile | null,
  spaceServices: SpaceService[],
  spaceServicesOriginal: SpaceService[],
  spacePhotos: SpacePhoto[],
  spacePhotosOriginal: SpacePhoto[],
  spacePhotoFiles: (File | null)[],
}

class SpaceForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      spaceProfile: defaultSpaceProfile,
      spaceProfileOriginal: null,
      spacePhotos: [],
      spacePhotosOriginal: [],
      spacePhotoFiles: [],
      spaceServices: [],
      spaceServicesOriginal: [],
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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        let spaceProfile = defaultSpaceProfile; // new space
        let spaceServices: SpaceService[] = [];
        let spacePhotos: SpacePhoto[] = [];
        let spacePhotoFiles: (File | null)[] = [];
        const { id } = this.props;
        if (id) {
          // eslint-disable-next-line no-console
          console.log('loading space data...', id);
          spaceProfile = await getSpace(this.context, id);
          spaceServices = await getSpaceServices(this.context, { spaceId: id });
          spacePhotos = await getSpacePhotos(this.context, { spaceId: id });
          const {
            spacePhotos: updatedPhotos, spacePhotoFiles: updatedPhotoFiles,
          } = this.reorderPhotosAndFiles(spacePhotos);
          spacePhotoFiles = updatedPhotoFiles.slice();
          spacePhotos = updatedPhotos.slice();
        }
        this.setMountedState({
          isLoading: false,
          spaceProfile,
          spaceProfileOriginal: spaceProfile,
          spaceServices,
          spaceServicesOriginal: spaceServices,
          spacePhotos,
          spacePhotosOriginal: spacePhotos,
          spacePhotoFiles,
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
    const { spaceProfileOriginal, spaceServicesOriginal, spacePhotosOriginal } = this.state;
    this.setMountedState({
      spaceProfile: spaceProfileOriginal,
      spaceServices: spaceServicesOriginal,
      spacePhotos: spacePhotosOriginal,
    });
  }

  hasFileChanges = () => {
    const { spacePhotoFiles } = this.state;
    return spacePhotoFiles.some((file) => !!file);
  }

  hasServiceChanges = () => {
    const { spaceServices, spaceServicesOriginal } = this.state;
    return spaceServices.length !== spaceServicesOriginal.length
      || spaceServices.some((spaceService, index) => !deepEqual(spaceService, spaceServicesOriginal[index]));
  }

  hasPhotoChanges = () => {
    const { spacePhotos, spacePhotosOriginal } = this.state;
    return spacePhotos.length !== spacePhotosOriginal.length
      || spacePhotos.some((spacePhoto, index) => !deepEqual(spacePhoto, spacePhotosOriginal[index]))
      || this.hasFileChanges();
  }

  hasProfileChanges = () => {
    const { spaceProfile, spaceProfileOriginal } = this.state;
    return !deepEqual(spaceProfile, spaceProfileOriginal);
  }

  hasChanges = () => this.hasProfileChanges() || this.hasPhotoChanges() || this.hasServiceChanges()

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
        const { onSave, studioProfile } = this.props;
        const {
          spaceProfile, spacePhotos, spacePhotoFiles, spacePhotosOriginal, spaceServices, spaceServicesOriginal,
        } = this.state;
        let { id: spaceId = 0 } = spaceProfile;
        if (this.hasProfileChanges() || !this.isEditing()) {
        // eslint-disable-next-line no-console
          console.log('will insert/update space', spaceProfile, 'in studio', studioProfile);
          const data = await setSpace(this.context, {
            spaceProfile, studioId: studioProfile.id,
          });
          // eslint-disable-next-line no-console
          console.log('got space data', data);
          spaceId = data.id;
        }
        if (this.hasPhotoChanges()) {
          // handle removed items
          const deleted = await Promise.all(spacePhotosOriginal.map((spacePhoto) => {
            const existingItem = spacePhotos?.find((item) => item.id === spacePhoto.id);
            if (existingItem) {
              // still there
              return Promise.resolve(null);
            }
            // deleted
            return deleteSpacePhoto(this.context, spacePhoto.id);
          }));
          // eslint-disable-next-line no-console
          console.log('deleted items', deleted);
          // handle new/updated items
          // eslint-disable-next-line no-console
          console.log('will insert/update space photos', spacePhotos);
          await Promise.all(spacePhotos.map((spacePhoto, index) => {
            // eslint-disable-next-line no-console
            console.log('will insert/update space photo', spacePhoto);
            return setSpacePhoto(this.context, {
              spacePhoto, spaceId, file: spacePhotoFiles[index],
            });
          }));
        }
        if (this.hasServiceChanges()) {
          // handle removed items
          const deleted = await Promise.all(spaceServicesOriginal.map((spaceService) => {
            const existingItem = spaceServices?.find((item) => item.spaceId === spaceService.spaceId
              && item.title === spaceService.title);
            if (existingItem) {
              // still there
              return Promise.resolve(null);
            }
            // deleted
            return deleteSpaceService(this.context, spaceService);
          }));
          // eslint-disable-next-line no-console
          console.log('deleted items', deleted);
          // handle new/updated items
          // eslint-disable-next-line no-console
          console.log('will insert/update space service', spaceServices);
          await Promise.all(spaceServices.map((spaceService) => {
            // eslint-disable-next-line no-console
            console.log('will insert/update space service', spaceService);
            return setSpaceService(this.context, {
              spaceService, spaceId,
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

  isValidProfile = () => {
    const { spaceProfile } = this.state;
    return Object.keys(spaceProfile).every((key: string) => (
      !spaceRequiredFields.includes(key as keyof SpaceProfile) || !!spaceProfile[key as keyof SpaceProfile]
    ));
  }

  isValidPhotos = () => {
    const { spacePhotos, spacePhotoFiles } = this.state;
    return spacePhotos.every((spacePhoto, index) => Object.keys(spacePhoto).every((key: string) => (
      !spacePhotoRequiredFields.includes(key as keyof SpacePhoto)
      || !!spacePhoto[key as keyof SpacePhoto]
      || !!spacePhotoFiles[index]
    )));
  }

  isValidServices = () => {
    const { spaceServices } = this.state;
    return spaceServices.length > 0 // at least one service is required
      && spaceServices.every((spaceService, index) => Object.keys(spaceService).every((key: string) => (
        (!spaceServiceRequiredFields.includes(key as keyof SpaceService)
          || !!spaceService[key as keyof SpaceService])
        && this.isUniqueTitle(spaceService, index)
      )));
  }

  isValidForm = () => this.isValidProfile() && this.isValidPhotos() && this.isValidServices()

  reorderPhotosAndFiles = (items: Photo[], spacePhotoFiles?: (File | null)[]) => {
    const updatedPhotoFiles = (spacePhotoFiles || Array.from(Array(items.length)).map(() => null)).slice();
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
    }) as SpacePhoto[];
    return {
      spacePhotos: updatedPhotos,
      spacePhotoFiles: updatedPhotoFiles,
    };
  }

  onPhotoItemsChange = (spacePhotos: Photo[], files?: (File | null)[]) => {
    const { spacePhotoFiles } = this.state;
    const {
      spacePhotos: updatedItems, spacePhotoFiles: updatedPhotoFiles,
    } = this.reorderPhotosAndFiles(spacePhotos, spacePhotoFiles);
    // eslint-disable-next-line no-console
    console.log('reordered items', {
      spacePhotos: updatedItems, spacePhotoFiles: files || updatedPhotoFiles,
    });
    this.setMountedState({
      spacePhotos: updatedItems,
      spacePhotoFiles: files || updatedPhotoFiles,
    });
  }

  isUniqueTitle = (item: SpaceService, index: number) => {
    const { spaceServices } = this.state;
    return spaceServices.every((spaceService, i) => index === i
      || item.spaceId !== spaceService.spaceId
      || item.title !== spaceService.title);
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
      <div className="space-form-footer">
        <p className="space-form-footer-note-required">
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
          <div className="space-form-loading space-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="space-form-notification space-form-spacer"
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
    const isRequired = required || spaceRequiredFields.includes(fieldName as keyof SpaceProfile);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonInput
          value={value}
          type="text"
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => {
            const { spaceProfile } = this.state;
            this.setMountedState({
              spaceProfile: {
                ...spaceProfile,
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
    const isRequired = required || spaceRequiredFields.includes(fieldName as keyof SpaceProfile);
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonTextarea
          value={value}
          required={isRequired}
          disabled={disabled}
          onIonChange={(e: any) => {
            const { spaceProfile } = this.state;
            this.setMountedState({
              spaceProfile: {
                ...spaceProfile,
                [fieldName]: e.detail.value || '',
              },
            });
          }}
        />
      </>
    );
  }

  renderPhotos = (disabled: boolean) => {
    const { spaceProfile, spacePhotos, spacePhotoFiles } = this.state;
    return (
      <div className="space-form-photo">
        <div className="space-form-photo-label">
          {this.renderLabel(i18n.t('Photos'))}
        </div>
        <PhotoList
          items={spacePhotos.map((spacePhoto) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { spaceId, ...photo } = spacePhoto;
            return photo;
          })}
          files={spacePhotoFiles}
          disabled={disabled}
          onAdd={() => {
            const updatedItems = spacePhotos.slice();
            const updatedFiles = spacePhotoFiles.slice();
            updatedItems.push({
              ...defaultSpacePhoto,
              spaceId: spaceProfile.id,
              order: updatedItems.length,
            });
            updatedFiles.push(null);
            this.onPhotoItemsChange(updatedItems, updatedFiles);
          }}
          onDelete={(index: number) => {
            const updatedItems = spacePhotos.slice();
            const updatedFiles = spacePhotoFiles.slice();
            updatedItems.splice(index, 1);
            updatedFiles.splice(index, 1);
            this.onPhotoItemsChange(updatedItems, updatedFiles);
          }}
          onOrderChange={this.onPhotoItemsChange}
          onChange={(item: Photo, index: number) => {
            const updatedItems = spacePhotos.slice();
            updatedItems[index] = {
              ...item,
              spaceId: spaceProfile.id,
            } as SpacePhoto;
            this.onPhotoItemsChange(updatedItems);
          }}
          onFileChange={(file: File | null, index: number) => {
            const updatedFiles = spacePhotoFiles.slice();
            updatedFiles[index] = file;
            // eslint-disable-next-line no-console
            console.log('will update files', updatedFiles, index);
            this.setMountedState({
              spacePhotoFiles: updatedFiles,
            });
          }}
        />
      </div>
    );
  }

  renderServices = (disabled: boolean) => {
    const { spaceServices, spaceProfile } = this.state;
    return (
      <div className="space-form-photo">
        <div className="space-form-photo-label">
          {this.renderLabel(i18n.t('Services'), true)}
        </div>
        <SpaceServiceList
          items={spaceServices}
          disabled={disabled}
          onAdd={() => {
            const updatedItems = spaceServices.slice();
            updatedItems.push({
              ...defaultSpaceService,
              spaceId: spaceProfile.id,
            });
            this.setMountedState({
              spaceServices: updatedItems,
            });
          }}
          onDelete={(index: number) => {
            const updatedItems = spaceServices.slice();
            updatedItems.splice(index, 1);
            this.setMountedState({
              spaceServices: updatedItems,
            });
          }}
          onChange={(item: SpaceService, index: number) => {
            const updatedItems = spaceServices.slice();
            updatedItems[index] = item;
            this.setMountedState({
              spaceServices: updatedItems,
            });
          }}
          // check whether title is unique for that space id (skip current index)
          isUniqueTitle={this.isUniqueTitle}
        />
      </div>
    );
  }

  renderFields = (disabled: boolean) => {
    const { studioProfile } = this.props;
    const { spaceProfile } = this.state;
    return (
      <IonList className="form-list space-form-list">
        <IonItem className="form-list-item">
          {this.renderTextInput({
            value: studioProfile.title,
            fieldName: 'studio',
            label: i18n.t('Studio'),
            disabled: true,
          })}
        </IonItem>
        <IonItem className="form-list-item">
          {this.renderTextInput({
            value: spaceProfile.title,
            fieldName: 'title',
            label: i18n.t('Title'),
            disabled,
          })}
        </IonItem>
        <IonItem className="form-list-item-full">
          {this.renderTextareaInput({
            value: spaceProfile.description,
            fieldName: 'description',
            label: i18n.t('Description'),
            disabled,
          })}
        </IonItem>
        <IonItem className="form-list-item-full">
          {this.renderServices(disabled)}
        </IonItem>
        <IonItem className="form-list-item-full">
          {this.renderPhotos(disabled)}
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { isLoading, error } = this.state;
    const disabled = isLoading || !!error;
    return (
      <form className="space-form" onSubmit={this.onSubmit}>
        <fieldset className="space-form-fieldset" disabled={disabled}>
          {this.renderFields(disabled)}
          {this.renderFooter()}
        </fieldset>
      </form>
    );
  }
}

SpaceForm.contextType = AppContext;

export default SpaceForm;
