import React from 'react';
import {
  IonAlert,
  IonButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  closeOutline,
  createOutline, people, trashOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { getSpaceServices } from '../../services/api/spaceServices';
import {
  canDeleteSpace, canUpdateSpace, deleteSpace, SpaceWithRole,
} from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingCalendar from '../BookingCalendar/BookingCalendar';
import SpaceServices from '../SpaceServices/SpaceServices';

// context
import AppContext from '../../context/AppContext';
import {
  canDeleteUsers, canInsertUsers, canReadUsers, canUpdateUsers,
} from '../../services/api/userRoles';
import { RoleType } from '../../services/api/roles';
import UserRoleList from '../UserRoleList/UserRoleList';

// css
// import './SpaceListItem.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  spaceServices: any[] | null,
  showDeleteAlert: boolean,
  showUserModal: boolean,
}

interface Props {
  spaceProfile: SpaceWithRole,
  studioProfile: StudioProfile,
  onModalOpen: (modalSelectedId?: number) => void,
  reloadItems: () => void,
}

class SpaceListItem extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      spaceServices: null,
      showDeleteAlert: false,
      showUserModal: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceProfile } = this.props;
    if (prevProps.spaceProfile.id !== spaceProfile.id) {
      this.loadItems();
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

  loadItems = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { spaceProfile } = this.props;
        const spaceServices = await getSpaceServices(this.context, { spaceId: spaceProfile.id });
        // eslint-disable-next-line no-console
        console.log('got space services', spaceServices);
        this.setMountedState({
          isLoading: false,
          spaceServices,
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

  onDelete = (selectedId: number) => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { reloadItems } = this.props;
        await deleteSpace(this.context, selectedId);
        reloadItems();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - onDelete', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  onUserModalOpen = () => {
    this.setMountedState({
      showUserModal: true,
    });
  }

  onUserModalClose = () => {
    this.setMountedState({
      showUserModal: false,
    });
  }

  // render

  renderModalUser = () => {
    const { spaceProfile, reloadItems } = this.props;
    const { showUserModal } = this.state;
    return (
      <IonModal
        cssClass="studio-card-modal"
        isOpen={showUserModal}
        onWillDismiss={() => this.onUserModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {i18n.t('Manage Space Users')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              onClick={() => this.onUserModalClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showUserModal && (
            <UserRoleList
              typeId={spaceProfile.id}
              roleType={RoleType.space}
              canInsert={canInsertUsers(this.context, RoleType.space, spaceProfile.roleName)}
              canUpdate={canUpdateUsers(this.context, RoleType.space, spaceProfile.roleName)}
              canDelete={canDeleteUsers(this.context, RoleType.space, spaceProfile.roleName)}
              onSave={() => reloadItems()}
              onCancel={() => this.onUserModalClose()}
            />
          )}
        </IonContent>
      </IonModal>
    );
  }

  render() {
    const { spaceProfile, studioProfile, onModalOpen } = this.props;
    const {
      isLoading, error, spaceServices, showDeleteAlert,
    } = this.state;

    if (isLoading) {
      return (
        <div className="space-list-loading space-list-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="space-list-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }

    if (!spaceServices || spaceServices.length === 0) {
      return (
        <p>{i18n.t('No services found.')}</p>
      );
    }

    return (
      <>
        <IonToolbar>
          <SpaceServices spaceId={spaceProfile.id} items={spaceServices} />
          <IonButtons slot="end" className="space-list-item-toolbar">
            <IonButton
              fill="clear"
              color="primary"
              title={i18n.t('Manage Space Users')}
              disabled={!canReadUsers(this.context, RoleType.space, spaceProfile.roleName)}
              onClick={() => this.onUserModalOpen()}
            >
              <IonIcon icon={people} ariaLabel={i18n.t('Manage Studio Users')} />
            </IonButton>
            <IonButton
              fill="clear"
              color="primary"
              title={i18n.t('Edit Space')}
              disabled={!canUpdateSpace(this.context, spaceProfile.roleName)}
              onClick={() => onModalOpen(spaceProfile.id)}
            >
              <IonIcon icon={createOutline} />
            </IonButton>
            <IonButton
              fill="clear"
              color="danger"
              title={i18n.t('Delete Space')}
              disabled={!canDeleteSpace(this.context, spaceProfile.roleName)}
              onClick={() => this.setMountedState({ showDeleteAlert: true })}
            >
              <IonIcon icon={trashOutline} />
            </IonButton>
            <IonAlert
              isOpen={showDeleteAlert}
              onDidDismiss={() => this.setMountedState({ showDeleteAlert: false })}
              header={i18n.t('Deletion Confirmation')}
              subHeader={spaceProfile.title || ''}
              message={i18n.t('Are you sure you want to delete this space?')}
              buttons={[
                {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => this.setMountedState({ showDeleteAlert: false }),
                },
                {
                  text: 'Okay',
                  cssClass: 'danger',
                  handler: () => this.onDelete(spaceProfile.id),
                },
              ]}
            />
          </IonButtons>
        </IonToolbar>
        <BookingCalendar
          height={400}
          spaceProfile={spaceProfile}
          studioProfile={studioProfile}
          spaceServices={spaceServices}
          showAddButton={canUpdateSpace(this.context, spaceProfile.roleName)}
          preventEdition={!canUpdateSpace(this.context, spaceProfile.roleName)}
          showPastWeeks
          showBookingDetails
        />
        {this.renderModalUser()}
      </>
    );
  }
}

SpaceListItem.contextType = AppContext;

export default SpaceListItem;
