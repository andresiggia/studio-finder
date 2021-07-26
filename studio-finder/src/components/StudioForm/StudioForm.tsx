import React from 'react';
import {
  IonLabel, IonIcon, IonSpinner, IonButton, IonGrid, IonRow, IonCol, IonList, IonInput, IonItem,
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
  defaultStudioProfile, getStudio, insertStudio, StudioProfile,
} from '../../services/api/studio';

// components
import Notification, { NotificationType } from '../Notification/Notification';

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
  studioProfileOriginal: StudioProfile | null,
}

class StudioForm extends React.Component<Props, State> {
  mounted = false

  requiredFields = ['title']

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      studioProfile: defaultStudioProfile,
      studioProfileOriginal: null,
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
        const { id } = this.props;
        if (id) {
          // eslint-disable-next-line no-console
          console.log('loading studio data...', id);
          studioProfile = await getStudio(this.context, id);
        }
        this.setMountedState({
          isLoading: false,
          studioProfile,
          studioProfileOriginal: studioProfile,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
        throw error;
      }
    });
  }

  onReset = () => {
    const { studioProfileOriginal } = this.state;
    this.setMountedState({
      studioProfile: studioProfileOriginal,
    });
  }

  hasChanges = () => {
    const { studioProfile, studioProfileOriginal } = this.state;
    return !deepEqual(studioProfile, studioProfileOriginal);
  }

  onSubmit = (e: any) => {
    // prevent form from submitting
    e.preventDefault();
    if (!this.isValidForm) {
      // eslint-disable-next-line no-console
      console.warn('Invalid form');
      return;
    }
    if (!this.hasChanges) {
      // eslint-disable-next-line no-console
      console.warn('Form has no changes');
      return;
    }
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { onSave } = this.props;
        const { studioProfile } = this.state;
        // eslint-disable-next-line no-console
        console.log('will insert new studio', studioProfile);
        const data = await insertStudio(this.context, studioProfile);
        // eslint-disable-next-line no-console
        console.log('got new studio data', data);
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
    const { studioProfile } = this.state;
    return Object.keys(studioProfile).every((key: string) => (
      !this.requiredFields.includes(key) || !!studioProfile[key as keyof StudioProfile]
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
    const canCancel = typeof onCancel === 'function';
    const showCancel = (canCancel && !hasChanges);
    return (
      <div className="studio-form-footer">
        <p className="studio-form-footer-note-required">
          {`* ${i18n.t('Required')}`}
        </p>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonButton
                fill="outline"
                type="button"
                expand="block"
                disabled={isLoading || !!error || (!canCancel && !hasChanges)}
                onClick={() => {
                  if (hasChanges) {
                    this.onReset();
                  } else if (typeof onCancel === 'function') {
                    onCancel();
                  }
                }}
              >
                <IonIcon slot="start" icon={refreshOutline} />
                {showCancel
                  ? i18n.t('Cancel')
                  : i18n.t('Reset')}
              </IonButton>
            </IonCol>
            <IonCol size="12" size-md="6">
              <IonButton
                color="primary"
                type="submit"
                expand="block"
                disabled={isLoading || !!error || !isValidForm || !hasChanges}
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

  renderFields = (disabled: boolean) => {
    const { studioProfile } = this.state;
    return (
      <IonList className="studio-form-list">
        <IonItem>
          {this.renderTextInput({
            value: studioProfile.title,
            fieldName: 'title',
            label: i18n.t('Title'),
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
