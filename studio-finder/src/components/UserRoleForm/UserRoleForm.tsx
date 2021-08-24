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
import { UserRoleDisplay, userRoleDisplayRequiredFields } from '../../services/api/userRoles';
import { Role, RoleType } from '../../services/api/roles';
import { searchUsersByEmail } from '../../services/api/users';

// components
import Autocomplete, { Result } from '../Autocomplete/Autocomplete';
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './UserRoleForm.css';

interface Props {
  index: number,
  item: UserRoleDisplay,
  roleType: RoleType,
  disabled: boolean,
  canDelete: boolean,
  onDelete: () => void,
  onChange: (item: UserRoleDisplay) => void,
  isNewUser: (id: string) => boolean,
}

class UserRoleForm extends React.Component<Props> {
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
      || userRoleDisplayRequiredFields.includes(fieldName as keyof UserRoleDisplay);
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
      || userRoleDisplayRequiredFields.includes(fieldName as keyof (UserRoleDisplay));
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

  renderAutocomplete = ({
    value, disabled = false, required = false, label, fieldName, onSearch, onSelect,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string,
    onSearch: (query: string) => Promise<Result[]>, onSelect: (result?: Result) => void,
  }) => {
    const isRequired = required
      || userRoleDisplayRequiredFields.includes(fieldName as keyof (UserRoleDisplay));
    return (
      <>
        {this.renderLabel(label, isRequired)}
        <Autocomplete
          value={value}
          required={isRequired}
          disabled={disabled}
          onSearch={onSearch}
          onSelect={onSelect}
        />
      </>
    );
  }

  renderFields = (disabled: boolean) => {
    const {
      item, roleType, isNewUser, onChange,
    } = this.props;
    const { state } = this.context;
    const selectedRole: Role = state.roles?.find((role: Role) => item.roleName === role.name);
    return (
      <IonList className="form-list">
        <IonItem className="form-list-item-full">
          {this.renderAutocomplete({
            value: item.userId
              ? `${`${item.name} ${item.surname}`.trim()} (${item.email})`.trim()
              : '',
            fieldName: 'userId',
            label: item.userId ? i18n.t('User') : i18n.t('Email Search'),
            disabled,
            onSelect: (result) => {
              // eslint-disable-next-line no-console
              console.log('user selected', result);
              const {
                email = '', id: userId = '', name = '', surname = '',
              } = result?.value || {};
              onChange({
                ...item,
                email,
                userId,
                name,
                surname,
              });
            },
            onSearch: (query: string) => (
              // eslint-disable-next-line no-async-promise-executor
              new Promise(async (resolve, reject) => {
                try {
                  // eslint-disable-next-line no-console
                  console.log('searching for', query);
                  const users = await searchUsersByEmail(this.context, {
                    query,
                  });
                  // eslint-disable-next-line no-console
                  console.log('got users', users);
                  resolve(users.map((user) => ({
                    label: `${`${user.name} ${user.surname}`.trim()} (${user.email})`.trim(),
                    value: user,
                    disabled: !isNewUser(user.id)
                      || state.user.id === user.id, // prevent user from editing their own access
                  })));
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.warn('error - onSearch', error);
                  reject(error);
                }
              })
            ),
          })}
        </IonItem>
        {!item.userId && (
          <IonItem className="form-list-item-full">
            <Notification
              type={NotificationType.warning}
              className="user-role-form-spacer"
              header={i18n.t('Users must register beforehand')}
              message={i18n.t('To find your users here, they must register with StudioFinder first')}
              preventDismiss
            />
          </IonItem>
        )}
        <IonItem className="form-list-item-full">
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
        {!!selectedRole && (
          <IonItem className="form-list-item-full">
            {selectedRole.permissions.map((permission) => {
              const pArr = [];
              if (permission.read) {
                pArr.push(i18n.t('View'));
              }
              if (permission.insert) {
                pArr.push(i18n.t('Create'));
              }
              if (permission.update) {
                pArr.push(i18n.t('Edit'));
              }
              if (permission.delete) {
                pArr.push(i18n.t('Delete'));
              }
              return (
                <React.Fragment key={permission.id}>
                  {this.renderTextInput({
                    value: pArr.join(', '),
                    fieldName: `role-${selectedRole.name}`,
                    label: `${i18n.t('Permissions')} - ${permission.entity?.toUpperCase()}`,
                    disabled: true,
                  })}
                </React.Fragment>
              );
            })}
          </IonItem>
        )}
      </IonList>
    );
  }

  render() {
    const { state } = this.context;
    const {
      disabled, index, item, canDelete, onDelete,
    } = this.props;
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
                disabled={disabled || !canDelete}
                title={i18n.t('Delete Item')}
                onClick={() => onDelete()}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
        {this.renderFields(disabled)}
        {state.user.id === item.userId && (
          <Notification
            type={NotificationType.danger}
            className="user-role-form-spacer"
            header={i18n.t('Editing is disabled')}
            message={i18n.t('You cannot change your own permission')}
            preventDismiss
          />
        )}
        <p className="user-role-form-note-required">
          {`* ${i18n.t('Required')}`}
        </p>
      </fieldset>
    );
  }
}

UserRoleForm.contextType = AppContext;

export default UserRoleForm;
