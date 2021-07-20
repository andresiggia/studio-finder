import React from 'react';
import {
  IonLabel, IonIcon, IonSegmentButton, IonSegment, IonSpinner, IonButton, IonGrid, IonRow, IonCol,
  IonList, IonItem, IonInput, IonDatetime, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  musicalNotesOutline, storefrontOutline, createOutline, refreshOutline, saveOutline,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';

// constants
import { userTypes, defaultUserProfile, UserProfile } from '../../services/api/user';

// components
import Notification, { NotificationProps } from '../Notification/Notification';

// css
import './ProfileForm.css';

interface Props {
  userType: string,
  unlockToEdit?: boolean,
}

interface State {
  allowEdit: boolean,
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
  // fields
  userType: string,
  userProfile: UserProfile,
  userProfileOriginal: UserProfile | null,
}

class ProfileForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      allowEdit: !props.unlockToEdit,
      isLoading: false,
      error: null,
      notification: null,
      userType: props.userType,
      userProfile: defaultUserProfile,
      userProfileOriginal: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();
  }

  componentDidUpdate(prevProps: Props) {
    const { state } = this.context;
    const { userType } = this.props;
    const { userProfileOriginal } = this.state;
    if (userType !== prevProps.userType || state.profile !== userProfileOriginal) {
      this.updateState();
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

  updateState = () => {
    const { state } = this.context;
    const { userType } = this.props;
    // eslint-disable-next-line no-console
    console.log('updating state...', state.profile);
    this.setMountedState({
      userType: state.user.user_metadata?.type || userType,
      userProfile: state.profile || defaultUserProfile,
      userProfileOriginal: state.profile,
    });
  }

  profileHasChanges = () => {
    const { state } = this.context;
    const { userProfile } = this.state;
    return userProfile !== (state.profile || defaultUserProfile);
  }

  typeHasChanges = () => {
    const { userType } = this.state;
    const { state } = this.context;
    return state.user.user_metadata.type !== userType;
  }

  hasChanges = () => this.typeHasChanges() || this.profileHasChanges()

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
        const { state, supabase } = this.context;
        const { updateProfile } = this.context;
        const { userType, userProfile } = this.state;
        if (!state.user.user_metadata?.type || this.typeHasChanges()) {
          // update user
          const { user, error } = await supabase.auth.update({
            data: {
              type: userType,
            },
          });
          if (error) {
            throw error;
          }
          // eslint-disable-next-line no-console
          console.log('user type updated', user);
        }
        if (this.profileHasChanges()) {
          await updateProfile(userProfile);
        }
        this.setMountedState({
          isLoading: false,
        }, () => this.updateState());
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
    const { state } = this.context;
    return !!state.profile;
  }

  isValidForm = () => {
    const { userType } = this.state;
    return !!userType;
  }

  // render

  renderLabel = (label: string, required = false) => (
    <IonLabel position="stacked">
      {`${label} ${required
        ? '*'
        : ''}`}
    </IonLabel>
  )

  renderUserType = (disabled: boolean) => {
    const { userType } = this.state;
    const options = [
      {
        key: userTypes.musician,
        title: i18n.t('Musician / Artist'),
        icon: musicalNotesOutline,
      },
      {
        key: userTypes.studio,
        title: i18n.t('Studio Representative'),
        icon: storefrontOutline,
      },
    ];
    return (
      <>
        <IonLabel class="profile-form-type-label">
          {`${i18n.t('Select an account type')}:`}
        </IonLabel>
        <IonSegment
          value={userType}
          disabled={disabled}
          onIonChange={(e: any) => {
            this.setMountedState({ userType: e.detail.value });
          }}
        >
          {options.map((item) => (
            <IonSegmentButton key={item.key} value={item.key}>
              <IonIcon className="profile-form-type-icon" icon={item.icon} ariaLabel={item.title} />
              <IonLabel>{item.title}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </>
    );
  }

  renderFooter = (showRequired: boolean) => {
    const { unlockToEdit } = this.props;
    const {
      isLoading, error, notification, allowEdit,
    } = this.state;
    const isValidForm = this.isValidForm();
    const hasChanges = this.hasChanges();
    return (
      <div className="profile-form-footer">
        {showRequired && (
          <p className="profile-form-footer-note-required">
            {`* ${i18n.t('Required')}`}
          </p>
        )}
        <IonGrid>
          <IonRow>
            {(unlockToEdit && !allowEdit)
              ? (
                <IonCol size="12" size-md="6">
                  <IonButton
                    fill="outline"
                    type="button"
                    expand="block"
                    onClick={() => this.setMountedState({ allowEdit: true })}
                  >
                    <IonIcon slot="start" icon={createOutline} />
                    {i18n.t('Edit')}
                  </IonButton>
                </IonCol>
              ) : (
                <>
                  <IonCol size="12" size-md="6">
                    <IonButton
                      fill="outline"
                      type="button"
                      expand="block"
                      disabled={isLoading || !!error || (!unlockToEdit && !hasChanges)}
                      onClick={() => {
                        if (hasChanges) {
                          this.updateState();
                        } else if (unlockToEdit) {
                          this.setMountedState({ allowEdit: false });
                        }
                      }}
                    >
                      <IonIcon slot="start" icon={refreshOutline} />
                      {(hasChanges || !unlockToEdit)
                        ? i18n.t('Reset')
                        : i18n.t('Cancel')}
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
                </>
              )}
          </IonRow>
        </IonGrid>
        {isLoading && (
          <div className="profile-form-loading profile-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type="danger"
            className="profile-form-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {!!notification && (
          <Notification
            type={notification?.type}
            className="profile-form-spacer"
            header={notification?.header}
            message={notification?.message}
            preventDismiss={notification?.preventDismiss}
            onDismiss={() => this.setMountedState({ notification: null })}
          />
        )}
      </div>
    );
  }

  renderTextInput = ({
    value, disabled, required = false, label, fieldName,
  }: {
    value: string, disabled: boolean, required?: boolean, label: string, fieldName: string,
  }) => (
    <>
      {this.renderLabel(label, required)}
      <IonInput
        value={value}
        type="text"
        required={required}
        disabled={disabled}
        onIonChange={(e: any) => {
          const { userProfile } = this.state;
          this.setMountedState({
            userProfile: {
              ...userProfile,
              [fieldName]: e.detail.value || '',
            },
          });
        }}
      />
    </>
  )

  renderFields = (disabled: boolean, showRequired: boolean) => {
    const { state } = this.context;
    const { userProfile } = this.state;
    return (
      <IonList className="profile-form-list">
        <IonItem>
          {this.renderTextInput({
            value: state.user.email,
            fieldName: 'email',
            label: i18n.t('Email'),
            disabled: true, // read-only field
          })}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: userProfile.name,
            fieldName: 'name',
            label: i18n.t('Name'),
            disabled,
            required: showRequired,
          })}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: userProfile.surname,
            fieldName: 'surname',
            label: i18n.t('Surname'),
            disabled,
            required: showRequired,
          })}
        </IonItem>
        <IonItem>
          {this.renderLabel(i18n.t('Date of birth'))}
          <IonDatetime
            displayFormat="DD MM YYYY"
            disabled={disabled}
            value={userProfile.birthday instanceof Date
              ? userProfile.birthday.toString()
              : null}
            onIonChange={(e: any) => {
              this.setMountedState({
                userProfile: {
                  ...userProfile,
                  birthday: e.detail.value
                    ? new Date(e.detail.value)
                    : null,
                },
              });
            }}
          />
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { unlockToEdit } = this.props;
    const { state } = this.context;
    const { isLoading, error, allowEdit } = this.state;
    const showRequired = !unlockToEdit || !!allowEdit;
    const disabled = isLoading || !!error || !showRequired;
    const isEditing = this.isEditing();
    return (
      <form className="profile-form" onSubmit={this.onSubmit}>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {isEditing
                ? i18n.t('My Profile')
                : i18n.t('Create Profile')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <fieldset className="profile-form-fieldset" disabled={disabled}>
              {(!state.user.user_metadata?.type || !state.profile) && (
                this.renderUserType(disabled)
              )}
              {this.renderFields(disabled, showRequired)}
              {this.renderFooter(showRequired)}
            </fieldset>
          </IonCardContent>
        </IonCard>
      </form>
    );
  }
}

ProfileForm.contextType = AppContext;

export default ProfileForm;
