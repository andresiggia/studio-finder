import React from 'react';
import {
  IonButton, IonCol, IonIcon, IonItem, IonLabel, IonReorder, IonRow, IonList, IonGrid,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, trashOutline } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { RoleType } from '../../services/api/roles';
import {
  defaultSpaceRoleDisplay, defaultStudioRoleDisplay, getUserRoles, SpaceUserRoleDisplay, StudioUserRoleDisplay, UserRoleDisplay,
} from '../../services/api/userRoles';

// context
import AppContext from '../../context/AppContext';

// components
import UserRoleForm from '../UserRoleForm/UserRoleForm';

// css
import './UserRoleList.css';

interface State {
  items: (StudioUserRoleDisplay | SpaceUserRoleDisplay)[] | null,
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

  onAdd = () => {
    const { roleType, typeId } = this.props;
    const { items } = this.state;
    const updatedItems = (items || []).slice();
    const defaultUserRole = roleType === RoleType.studio
      ? defaultStudioRoleDisplay
      : defaultSpaceRoleDisplay;
    const typeIdName = roleType === RoleType.studio
      ? 'spaceId'
      : 'studioId';
    updatedItems.push({
      ...defaultUserRole,
      [typeIdName]: typeId,
    });
    this.setMountedState({
      items: updatedItems,
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

  // render

  renderSelectedItem = () => {
    const { roleType } = this.props;
    const {
      items, selectedIndex, isLoading, error,
    } = this.state;
    if (!items || !items[selectedIndex]) {
      return null;
    }
    const item = items[selectedIndex];
    const disabled = isLoading || !!error;
    return (
      <UserRoleForm
        index={selectedIndex}
        item={item}
        disabled={disabled}
        roleType={roleType}
        onChange={(updatedItem: StudioUserRoleDisplay | SpaceUserRoleDisplay) => this.onChange(updatedItem, selectedIndex)}
        onDelete={() => this.onDelete(selectedIndex)}
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
      </IonGrid>
    );
  }
}

UserRoleList.contextType = AppContext;

export default UserRoleList;
