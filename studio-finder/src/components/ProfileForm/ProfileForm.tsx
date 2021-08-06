import React from 'react';
import {
  IonLabel, IonIcon, IonSegmentButton, IonSegment, IonSpinner, IonButton, IonGrid, IonRow, IonCol, IonList,
  IonItem, IonInput, IonDatetime, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal, IonButtons,
  IonContent, IonTitle, IonToolbar, IonAvatar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  musicalNotesOutline, storefrontOutline, createOutline, refreshOutline, saveOutline, lockClosedOutline, closeOutline,
  person, trashOutline,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import {
  UserType, defaultUserProfile, UserProfile, updateUserType,
} from '../../services/api/users';
import { deepEqual } from '../../services/helpers/misc';

// components
import Notification, { NotificationProps, NotificationType } from '../Notification/Notification';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';
import FileUpload from '../FileUpload/FileUpload';

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
  showPasswordModal: boolean,
  // fields
  userType: string,
  userProfile: UserProfile,
  userProfileOriginal: UserProfile | null,
  file: File | null,
  filePreview: string,
}

class ProfileForm extends React.Component<Props, State> {
  mounted = false

  requiredFields = ['name', 'surname']

  fileReader = new FileReader()

  constructor(props: Props) {
    super(props);
    this.state = {
      allowEdit: !props.unlockToEdit,
      isLoading: false,
      error: null,
      notification: null,
      showPasswordModal: false,
      userType: props.userType,
      userProfile: defaultUserProfile,
      userProfileOriginal: null,
      file: null,
      filePreview: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();

    this.fileReader.onload = (e: any) => {
      const { file } = this.state;
      if (file) {
        const filePreview = e.target.result;
        this.setMountedState({
          filePreview,
        });
      }
    };
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
    const { userType, unlockToEdit } = this.props;
    // eslint-disable-next-line no-console
    console.log('updating state...', state.profile);
    this.setMountedState({
      allowEdit: !unlockToEdit,
      userType: state.user.user_metadata?.type || userType,
      userProfile: state.profile || defaultUserProfile,
      userProfileOriginal: state.profile,
    });
  }

  profileHasChanges = () => {
    const { state } = this.context;
    const { userProfile } = this.state;
    return !deepEqual(userProfile, (state.profile || defaultUserProfile)) || this.fileHasChanges();
  }

  typeHasChanges = () => {
    const { userType } = this.state;
    const { state } = this.context;
    return state.user.user_metadata.type !== userType;
  }

  fileHasChanges = () => {
    const { file } = this.state;
    return !!file;
  }

  hasChanges = () => this.typeHasChanges() || this.profileHasChanges()

  onFileChange = (files: File[]) => {
    const file = files.length > 0 ? files[0] : null;
    if (file) {
      this.fileReader.readAsDataURL(file);
    }
    this.setMountedState({
      file,
      filePreview: '',
    });
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
        const { state, updateProfile } = this.context;
        const { userType, userProfile, file } = this.state;
        if (!state.user.user_metadata?.type || this.typeHasChanges()) {
          const user = await updateUserType(this.context, userType);
          // eslint-disable-next-line no-console
          console.log('user type updated', user);
        }
        if (this.profileHasChanges()) {
          await updateProfile(userProfile, file);
        }
        this.setMountedState({
          isLoading: false,
        }, () => this.updateState());
      } catch (newError) {
        // eslint-disable-next-line no-console
        console.warn('error - onSubmit', newError);
        this.setMountedState({
          isLoading: false,
          error: newError,
        });
      }
    });
  }

  isEditing = () => {
    const { state } = this.context;
    return !!state.profile;
  }

  isValidForm = () => {
    const { userType, userProfile } = this.state;
    return !!userType
      // check all required fields
      && Object.keys(userProfile).every((key: string) => (
        !this.requiredFields.includes(key) || !!userProfile[key as keyof UserProfile]
      ));
  }

  onModalOpen = () => {
    this.setMountedState({
      showPasswordModal: true,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showPasswordModal: false,
    });
  }

  // render

  renderLabel = (label: string, required = false) => (
    <IonLabel position="stacked" className="profile-form-label">
      {`${label} ${required
        ? '*'
        : ''}`}
    </IonLabel>
  )

  renderUserType = (disabled: boolean) => {
    const { userType } = this.state;
    const options = [
      {
        key: UserType.musician,
        title: i18n.t('Musician / Artist'),
        icon: musicalNotesOutline,
      },
      {
        key: UserType.studio,
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
        {isLoading && (
          <div className="profile-form-loading profile-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
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
            onDismiss={notification?.onDismiss || (() => this.setMountedState({ notification: null }))}
          />
        )}
        <IonGrid>
          <IonRow>
            {(unlockToEdit && !allowEdit)
              ? (
                <>
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
                  <IonCol size="12" size-md="6">
                    <IonButton
                      fill="outline"
                      type="button"
                      expand="block"
                      onClick={() => this.onModalOpen()}
                    >
                      <IonIcon slot="start" icon={lockClosedOutline} />
                      {i18n.t('Change Password')}
                    </IonButton>
                  </IonCol>
                </>
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
                      fill="solid"
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
      </div>
    );
  }

  renderTextInput = ({
    value, disabled = false, required = false, label, fieldName,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
  }, showRequired: boolean) => {
    const isRequired = showRequired && (required || this.requiredFields.includes(fieldName));
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <IonInput
          value={value}
          type="text"
          required={isRequired}
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
    );
  }

  renderFields = (disabled: boolean, showRequired: boolean) => {
    const { state } = this.context;
    const { userProfile, file, filePreview } = this.state;
    return (
      <IonList className="profile-form-list">
        <IonItem>
          {this.renderTextInput({
            value: state.user.email,
            fieldName: 'email',
            label: i18n.t('Email'),
            disabled: true, // read-only field
          }, showRequired)}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: userProfile.name,
            fieldName: 'name',
            label: i18n.t('Name'),
            disabled,
          }, showRequired)}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: userProfile.surname,
            fieldName: 'surname',
            label: i18n.t('Surname'),
            disabled,
          }, showRequired)}
        </IonItem>
        {showRequired && (
          <IonItem>
            {this.renderLabel(i18n.t('Photo'))}
            {userProfile.photoUrl
              ? (
                <div className="profile-form-photo">
                  {this.renderAvatar(userProfile.photoUrl)}
                  <IonButton
                    color="danger"
                    fill="clear"
                    title={i18n.t('Remove Photo')}
                    onClick={() => this.setMountedState({
                      userProfile: {
                        ...userProfile,
                        photoUrl: '',
                      },
                    })}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              ) : (
                <>
                  {(!!file && !!filePreview) && (
                    this.renderAvatar(filePreview)
                  )}
                  <FileUpload
                    files={file ? [file] : []}
                    accept=".png,.jpg,.jpeg"
                    onChange={this.onFileChange}
                  />
                </>
              )}
          </IonItem>
        )}
        <IonItem>
          {this.renderLabel(i18n.t('Date of birth'))}
          <IonDatetime
            displayFormat="DD MM YYYY"
            disabled={disabled}
            value={(!!userProfile.birthday && userProfile.birthday instanceof Date)
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

  renderAvatar = (photoUrl: string, className = '') => (
    <IonAvatar className={`profile-avatar ${className}`}>
      {photoUrl
        ? (
          <img src={photoUrl} alt={i18n.t('Photo')} />
        ) : (
          <IonIcon className="profile-avatar-icon" icon={person} />
        )}
    </IonAvatar>
  )

  renderModal = () => {
    const { showPasswordModal } = this.state;
    return (
      <IonModal
        isOpen={showPasswordModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {i18n.t('Change Password')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              onClick={() => this.onModalClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showPasswordModal && (
            <ChangePasswordForm onCancel={() => this.onModalClose()} />
          )}
        </IonContent>
      </IonModal>
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
      <>
        <form className="profile-form" onSubmit={this.onSubmit}>
          <IonCard>
            <IonCardHeader>
              {(unlockToEdit && !allowEdit) && (
                this.renderAvatar(state.profile?.photoUrl, 'profile-float-right')
              )}
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
        {this.renderModal()}
      </>
    );
  }
}

ProfileForm.contextType = AppContext;

export default ProfileForm;
