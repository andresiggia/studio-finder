import React from 'react';
import {
  IonLabel, IonList, IonItem, IonSelectOption, IonSelect, IonButton, IonButtons, IonIcon, IonToolbar,
  IonTitle, IonInput, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { trashOutline } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceUserRoleDisplay, StudioUserRoleDisplay, userRoleDisplayRequiredFields } from '../../services/api/userRoles';
import { deepEqual } from '../../services/helpers/misc';
import { Role, RoleType } from '../../services/api/roles';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './UserRoleForm.css';

interface Props {
  index: number,
  item: StudioUserRoleDisplay | SpaceUserRoleDisplay,
  roleType: RoleType,
  disabled: boolean,
  onDelete: () => void,
  onChange: (item: StudioUserRoleDisplay | SpaceUserRoleDisplay) => void,
}

interface State {
  email: string,
  isLoading: boolean,
  error: Error | null,
}

class UserRoleForm extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      email: '',
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();
  }

  componentDidUpdate(prevProps: Props) {
    const { index, item } = this.props;
    if (prevProps.index !== index
      || !deepEqual(prevProps.item, item)) {
      this.updateState();
    }
  }

  componentWillUnmount() {
    this.setMountedState({
      showModal: false,
    });
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
    this.setMountedState({
      email: '',
    });
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
    <IonLabel position="stacked" className="user-role-form-label">
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
    const isRequired = required
      || userRoleDisplayRequiredFields.includes(fieldName as keyof (StudioUserRoleDisplay | SpaceUserRoleDisplay));
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

  renderSelectInput = ({
    value, disabled = false, required = false, label, fieldName, options, onChange,
  }: {
    value: any, disabled?: boolean, required?: boolean, label: string, fieldName: string,
    options: { value: any, label: string }[], onChange?: (value: any) => void,
  }) => {
    const isRequired = required
      || userRoleDisplayRequiredFields.includes(fieldName as keyof (StudioUserRoleDisplay | SpaceUserRoleDisplay));
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
    const { item, roleType } = this.props;
    const {
      email, isLoading, error,
    } = this.state;
    const { state } = this.context;
    return (
      <IonList className="form-list">
        <IonItem className="form-list-item-full">
          {item.email
            ? (
              this.renderTextInput({
                value: `${`${item.name} ${item.surname}`.trim()} (${item.email})`.trim(),
                fieldName: 'email',
                label: i18n.t('User'),
                disabled: true,
              })
            ) : (
              this.renderTextInput({
                value: email,
                fieldName: 'email',
                label: i18n.t('Email'),
                disabled,
              })
            )}
          {isLoading && (
            <div className="user-role-form-loading user-role-form-spacer">
              <IonSpinner name="bubbles" />
            </div>
          )}
          {!!error && (
            <Notification
              type={NotificationType.danger}
              className="user-role-form-notification user-role-form-spacer"
              header={i18n.t('Error')}
              message={error?.message || i18n.t('An error occurred, please try again later')}
              onDismiss={() => this.setMountedState({ error: null })}
            />
          )}
        </IonItem>
        <IonItem className="form-list-item">
          {this.renderSelectInput({
            value: item.roleName,
            fieldName: 'roleName',
            label: i18n.t('Role'),
            disabled,
            options: state.roles
              .filter((role: Role) => role.type === roleType)
              .map((role: Role) => ({
                value: role.name,
                label: role.title,
              })),
          })}
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { disabled, index, onDelete } = this.props;
    return (
      <fieldset className="user-role-form-fieldset" disabled={disabled}>
        <IonToolbar className="user-role-form-toolbar">
          <IonTitle size="small" className="user-role-form-title">
            {`${i18n.t('User')} #${index + 1}`}
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

UserRoleForm.contextType = AppContext;

export default UserRoleForm;
