import React from 'react';
import {
  IonLabel, IonIcon, IonSegmentButton, IonSegment, IonTitle, IonSpinner, IonButton,
  IonGrid, IonRow, IonCol, IonList, IonItem, IonInput, IonDatetime,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { musicalNotesOutline, storefrontOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';

// constants
import { USER_TYPES } from '../../constants/user-types';

// components
import Notification, { NotificationProps } from '../Notification/Notification';

// css
import './ProfileForm.css';

interface Props {
  userType: string,
}

interface State {
  isLoading: boolean,
  error: Error | null,
  notification: NotificationProps | null,
  // fields
  userType: string,
  name: string,
  surname: string,
  birthday: Date | null,
  // postCode: string,
  // city: string,
  // region: string,
  // country: string,
}

class ProfileForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      notification: null,
      userType: props.userType,
      name: '',
      surname: '',
      birthday: null,
      // postCode: '',
      // city: '',
      // region: '',
      // country: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentDidUpdate(prevProps: Props) {
    const { userType } = this.props;
    if (userType !== prevProps.userType) {
      this.updateState();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateState = () => {
    const { state } = this.context;
    const { userType } = this.props;
    this.setState({
      userType: state.user.user_metadata?.type || userType,
    });
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else if (typeof callback === 'function') {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      callback();
    }
  }

  onSubmit = (e: any) => {
    // prevent form from submitting
    e.preventDefault();
    // to do
    console.log('onSubmit');
  }

  isEditing = () => {
    const { state } = this.context;
    return !!state.user.user_metadata?.type;
  }

  isValidForm = () => {
    const { userType } = this.state;
    return !!userType;
  }

  // render

  renderUserType = (disabled: boolean) => {
    const { userType } = this.state;
    const options = [
      {
        key: USER_TYPES.musician,
        title: i18n.t('Musician / Artist'),
        icon: musicalNotesOutline,
      },
      {
        key: USER_TYPES.studio,
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

  renderFooter = (disabled: boolean) => {
    const { isLoading, error, notification } = this.state;
    const isValidForm = this.isValidForm();
    return (
      <div className="profile-form-footer">
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonButton
                fill="outline"
                type="reset"
                expand="block"
                disabled={disabled}
                onClick={this.updateState}
              >
                {i18n.t('Reset')}
              </IonButton>
            </IonCol>
            <IonCol size="12" size-md="6">
              <IonButton
                color="primary"
                type="submit"
                expand="block"
                disabled={disabled || !isValidForm}
              >
                {i18n.t('Save')}
              </IonButton>
            </IonCol>
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
      <IonLabel position="stacked">
        {label}
      </IonLabel>
      <IonInput
        value={value}
        type="text"
        required={required}
        disabled={disabled}
        onIonChange={(e: any) => {
          this.setMountedState({
            [fieldName]: e.detail.value || '',
          });
        }}
      />
    </>
  )

  renderFields = (disabled: boolean) => {
    const { state } = this.context;
    const { name, surname, birthday } = this.state;
    return (
      <IonList className="login-form-list">
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
            value: name,
            fieldName: 'name',
            label: i18n.t('Name'),
            disabled,
            required: true,
          })}
        </IonItem>
        <IonItem>
          {this.renderTextInput({
            value: surname,
            fieldName: 'surname',
            label: i18n.t('Surname'),
            disabled,
            required: true,
          })}
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">
            {i18n.t('Date of birth')}
          </IonLabel>
          <IonDatetime
            displayFormat="DD MM YYYY"
            disabled={disabled}
            value={birthday instanceof Date
              ? birthday.toString()
              : null}
            onIonChange={(e: any) => {
              this.setMountedState({
                birthday: e.detail.value
                  ? new Date(e.detail.value)
                  : null,
              });
            }}
          />
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { state } = this.context;
    const { isLoading, error } = this.state;
    const disabled = isLoading || !!error;
    const isEditing = this.isEditing();
    return (
      <IonGrid>
        <IonRow>
          <IonCol size="12" size-lg="6" offset-lg="3" size-md="8" offset-md="2">
            <form className="profile-form" onSubmit={this.onSubmit}>
              <fieldset className="profile-form-fieldset" disabled={disabled}>
                <IonTitle class="profile-form-title">
                  {isEditing
                    ? i18n.t('Edit Profile')
                    : i18n.t('Create Profile')}
                </IonTitle>
                {!state.user.user_metadata?.type && (
                  this.renderUserType(disabled)
                )}
                {this.renderFields(disabled)}
                {this.renderFooter(disabled)}
              </fieldset>
            </form>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }
}

ProfileForm.contextType = AppContext;

export default ProfileForm;
