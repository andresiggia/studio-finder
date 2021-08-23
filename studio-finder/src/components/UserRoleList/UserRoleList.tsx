import React from 'react';
import {
  IonButton, IonCol, IonIcon, IonItem, IonLabel, IonReorder, IonRow, IonList, IonGrid, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  addOutline, refreshOutline, saveOutline, trashOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { RoleType } from '../../services/api/roles';
import {
  defaultUserRole, defaultUserRoleDisplay, getUserRoles, setUserRole, UserRoleDisplay, userRoleDisplayRequiredFields,
} from '../../services/api/userRoles';
import { deepEqual } from '../../services/helpers/misc';

// context
import AppContext from '../../context/AppContext';

// components
import UserRoleForm from '../UserRoleForm/UserRoleForm';
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './UserRoleList.css';

interface State {
  items: UserRoleDisplay[] | null,
  itemsOriginal: UserRoleDisplay[] | null,
  selectedIndex: number,
  isLoading: boolean,
  error: Error | null,
}

interface Props {
  roleType: RoleType,
  typeId: number,
}

class UserRoleList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      items: null,
      itemsOriginal: null,
      selectedIndex: -1,
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { roleType, typeId } = this.props;
    if (prevProps.roleType !== roleType
      || prevProps.typeId !== typeId) {
      this.loadData();
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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { roleType, typeId } = this.props;
        // eslint-disable-next-line no-console
        console.log('will load user roles for', roleType, typeId);
        const items = await getUserRoles(this.context, {
          roleType, typeId,
        });
        // eslint-disable-next-line no-console
        console.log('got user roles', items);
        let selectedIndex = 0;
        // pre-select first item
        if (items?.length > 0) {
          selectedIndex = 0;
        }
        this.setMountedState({
          isLoading: false,
          items,
          itemsOriginal: items,
          selectedIndex,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadItems', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  onReset = () => {
    const { itemsOriginal } = this.state;
    this.setMountedState({
      items: itemsOriginal,
    });
  }

  onAdd = () => {
    const { items } = this.state;
    const updatedItems = (items || []).slice();
    updatedItems.push(defaultUserRoleDisplay);
    this.setMountedState({
      items: updatedItems,
      selectedIndex: updatedItems.length - 1,
    });
  }

  onDelete = (index: number) => {
    const { items } = this.state;
    const updatedItems = (items || []).slice();
    updatedItems.splice(index, 1);
    this.setMountedState({
      items: updatedItems,
    });
  }

  onChange = (item: UserRoleDisplay, index: number) => {
    const { items } = this.state;
    const updatedItems = (items || []).map((oItem, i) => {
      if (index === i) {
        return item;
      }
      return oItem;
    });
    this.setMountedState({
      items: updatedItems,
    });
  }

  isValidForm = () => {
    const { items } = this.state;
    return !!items && items.every((item) => (
      // check all required fields
      !!item && Object.keys(item).every((key: string) => (
        !userRoleDisplayRequiredFields.includes(key as keyof UserRoleDisplay) || !!item[key as keyof UserRoleDisplay]
      ))
    ));
  }

  hasChanges = () => {
    const { items, itemsOriginal } = this.state;
    return !!items && !!itemsOriginal
      && (items.length !== itemsOriginal.length
        || (items || []).some((item, index) => !deepEqual(item, itemsOriginal[index])));
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
        const { typeId, roleType } = this.props;
        const { items } = this.state;
        if (items && this.hasChanges()) {
          await Promise.all(items?.map((userRoleDisplay) => {
            // remove extra fields to convert UserRoleDisplay to UserRole
            const userRole: any = {};
            Object.keys(defaultUserRole).forEach((key: string) => {
              userRole[key] = userRoleDisplay[key as keyof UserRoleDisplay];
            });
            return setUserRole(this.context, {
              userRole, typeId, roleType,
            });
          }));
        }
        this.setMountedState({
          isLoading: false,
        }, () => this.loadData());
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

  // render

  renderSelectedItem = () => {
    const { state } = this.context;
    const { roleType } = this.props;
    const {
      items, selectedIndex, isLoading, error,
    } = this.state;
    if (!items || !items[selectedIndex]) {
      return null;
    }
    const item = items[selectedIndex];
    const disabled = isLoading || !!error
      || state.user.id === item.userId; // prevent user from editing their own access
    return (
      <UserRoleForm
        index={selectedIndex}
        item={item}
        disabled={disabled}
        roleType={roleType}
        onChange={(updatedItem: UserRoleDisplay) => this.onChange(updatedItem, selectedIndex)}
        onDelete={() => this.onDelete(selectedIndex)}
        isNewUser={(id: string) => items.every((bItem) => bItem.userId !== id)}
      />
    );
  }

  renderItems = () => {
    const { items, selectedIndex } = this.state;
    if (!items) {
      return null;
    }
    return (
      <IonList className="user-role-list-items">
        {items.map((item, index) => {
          const fullName = `${item.name} ${item.surname}`.trim();
          const label = `${index + 1}. ${fullName || `(${i18n.t('No user')})`}`;
          return (
            <IonItem
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              detail
              button
              color={index === selectedIndex
                ? 'primary'
                : ''}
              onClick={() => this.setMountedState({ selectedIndex: index })}
              title={label}
            >
              <IonReorder slot="start" />
              <IonLabel>{label}</IonLabel>
              <IonButton
                slot="end"
                size="small"
                color={index === selectedIndex
                  ? 'light'
                  : 'danger'}
                fill="clear"
                title={i18n.t('Delete User')}
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = index >= selectedIndex
                    ? selectedIndex - 1
                    : selectedIndex;
                  this.setMountedState({
                    selectedIndex: newIndex,
                  }, () => this.onDelete(index));
                }}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          );
        })}
        <IonItem
          button
          onClick={() => this.onAdd()}
          title={i18n.t('Add User')}
        >
          <IonIcon icon={addOutline} />
          <IonLabel>
            {i18n.t('User')}
          </IonLabel>
        </IonItem>
      </IonList>
    );
  }

  renderFooter = () => {
    const { isLoading, error } = this.state;
    const isValidForm = this.isValidForm();
    const hasChanges = this.hasChanges();
    return (
      <div className="user-role-form-footer">
        {isLoading && (
          <div className="user-role-form-loading user-role-form-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="user-role-form-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonButton
                fill="outline"
                type="button"
                expand="block"
                disabled={isLoading || !!error || !hasChanges}
                onClick={() => this.onReset()}
              >
                <IonIcon slot="start" icon={refreshOutline} />
                {i18n.t('Reset')}
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
          </IonRow>
        </IonGrid>
      </div>
    );
  }

  render() {
    const { items, selectedIndex } = this.state;

    if (!items) {
      return null;
    }

    if (items.length === 0) {
      return (
        <>
          <p>{i18n.t('No users found.')}</p>
          <IonButton
            fill="solid"
            color="primary"
            title={i18n.t('Add User')}
            onClick={() => this.onAdd()}
          >
            <IonIcon slot="start" icon={addOutline} />
            {i18n.t('User')}
          </IonButton>
        </>
      );
    }

    return (
      <form className="user-role-list-form" onSubmit={this.onSubmit}>
        <IonGrid>
          <IonRow style={{ width: '100%' }}>
            <IonCol size="6" size-lg="4">
              {this.renderItems()}
            </IonCol>
            <IonCol size="6" size-lg="8">
              {selectedIndex > -1 && (
                this.renderSelectedItem()
              )}
            </IonCol>
          </IonRow>
          {this.renderFooter()}
        </IonGrid>
      </form>
    );
  }
}

UserRoleList.contextType = AppContext;

export default UserRoleList;
