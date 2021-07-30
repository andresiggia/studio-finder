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

// constants
import {
  defaultSpaceProfile, getSpace, upsertSpace, SpaceProfile,
} from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';

// components
import Notification, { NotificationType } from '../Notification/Notification';

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
}

class SpaceForm extends React.Component<Props, State> {
  mounted = false

  requiredFields = ['title']

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      spaceProfile: defaultSpaceProfile,
      spaceProfileOriginal: null,
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
        let spaceProfile = defaultSpaceProfile; // new space
        const { id } = this.props;
        if (id) {
          // eslint-disable-next-line no-console
          console.log('loading space data...', id);
          spaceProfile = await getSpace(this.context, id);
        }
        this.setMountedState({
          isLoading: false,
          spaceProfile,
          spaceProfileOriginal: spaceProfile,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
        throw error;
      }
    });
  }

  onReset = () => {
    const { spaceProfileOriginal } = this.state;
    this.setMountedState({
      spaceProfile: spaceProfileOriginal,
    });
  }

  hasChanges = () => {
    const { spaceProfile, spaceProfileOriginal } = this.state;
    return !deepEqual(spaceProfile, spaceProfileOriginal);
  }

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
        const { spaceProfile } = this.state;
        // eslint-disable-next-line no-console
        console.log('will insert new space', spaceProfile, 'in studio', studioProfile);
        const data = await upsertSpace(this.context, { spaceProfile, studioProfile });
        // eslint-disable-next-line no-console
        console.log('got new space data', data);
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
    const { spaceProfile } = this.state;
    return Object.keys(spaceProfile).every((key: string) => (
      !this.requiredFields.includes(key) || !!spaceProfile[key as keyof SpaceProfile]
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
    const isRequired = required || this.requiredFields.includes(fieldName);
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

  renderFields = (disabled: boolean) => {
    const { studioProfile } = this.props;
    const { spaceProfile } = this.state;
    return (
      <IonList className="space-form-list">
        <IonItem>
          {this.renderTextInput({
            value: studioProfile.title,
            fieldName: 'studio',
            label: i18n.t('Studio'),
            disabled: true,
          })}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: spaceProfile.title,
            fieldName: 'title',
            label: i18n.t('Title'),
            disabled,
          })}
        </IonItem>
        <IonItem>
          {this.renderTextareaInput({
            value: spaceProfile.description,
            fieldName: 'description',
            label: i18n.t('Description'),
            disabled,
          })}
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
