import React from 'react';
import {
  IonAlert,
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonGrid, IonIcon, IonModal,
  IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  addOutline, closeOutline, createOutline, trashOutline, people,
} from 'ionicons/icons';

// services
import {
  canDeleteStudio, canUpdateStudio, deleteStudio, getStudiosByUser, StudioWithRole,
} from '../../services/api/studios';
import i18n from '../../services/i18n/i18n';
import { sortByKey } from '../../services/helpers/misc';
import { RoleType } from '../../services/api/roles';
import {
  canDeleteUsers, canInsertUsers, canReadUsers, canUpdateUsers,
} from '../../services/api/userRoles';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import StudioForm from '../StudioForm/StudioForm';
import SpaceList from '../SpaceList/SpaceList';
import UserRoleList from '../UserRoleList/UserRoleList';

// context
import AppContext from '../../context/AppContext';

// css
import './StudioCard.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: StudioWithRole[] | null,
  selectedId: number,
  showStudioModal: boolean,
  modalSelectedId: number,
  showDeleteAlert: boolean,
  showUserModal: boolean,
}

class StudioCard extends React.Component<any, State> {
  mounted = false

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      selectedId: 0,
      showStudioModal: false,
      modalSelectedId: 0,
      showDeleteAlert: false,
      showUserModal: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentWillUnmount() {
    this.setMountedState({
      showStudioModal: false,
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
        const items = await getStudiosByUser(this.context);
        // eslint-disable-next-line no-console
        console.log('got studios', items);
        let selectedId = 0;
        // pre-select first item
        if (items?.length > 0) {
          selectedId = items[0].id;
        }
        this.setMountedState({
          isLoading: false,
          items,
          selectedId,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
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

  onStudioModalOpen = (modalSelectedId = 0) => {
    this.setMountedState({
      showStudioModal: true,
      modalSelectedId,
    });
  }

  onStudioModalClose = () => {
    this.setMountedState({
      showStudioModal: false,
    });
  }

  onDelete = (selectedId: number) => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        await deleteStudio(this.context, selectedId);
        this.loadData();
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

  // render

  renderSpaces = () => {
    const { items, selectedId } = this.state;
    const studioProfile = items?.find((item) => item.id === selectedId);
    if (!studioProfile) {
      return (
        <Notification
          type={NotificationType.danger}
          className="studio-card-spacer"
          header={i18n.t('Not found')}
          message={i18n.t('Invalid selected studio')}
          onDismiss={() => this.setMountedState({ selectedId: 0 })}
        />
      );
    }
    return (
      <SpaceList studioProfile={studioProfile} />
    );
  }

  renderContent = () => {
    const {
      isLoading, error, items, selectedId,
    } = this.state;
    return (
      <>
        {isLoading && (
          <div className="studio-card-loading studio-card-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="studio-card-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {!items || items.length === 0
          ? (
            <div className="studio-card-spacer">
              <p>{i18n.t('No studios found.')}</p>
              <IonButton
                type="button"
                color="primary"
                fill="solid"
                title={i18n.t('Add Studio')}
                onClick={() => this.onStudioModalOpen()}
              >
                <IonIcon slot="start" icon={addOutline} />
                {i18n.t('Studio')}
              </IonButton>
            </div>
          ) : !!selectedId && (
            this.renderSpaces()
          )}
      </>
    );
  }

  renderModalStudio = () => {
    const { showStudioModal, modalSelectedId } = this.state;
    return (
      <IonModal
        cssClass="studio-card-modal"
        isOpen={showStudioModal}
        onWillDismiss={() => this.onStudioModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {modalSelectedId
              ? i18n.t('Edit Studio')
              : i18n.t('Create Studio')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              onClick={() => this.onStudioModalClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showStudioModal && (
            <StudioForm
              id={modalSelectedId}
              onCancel={() => this.onStudioModalClose()}
              onSave={() => {
                this.onStudioModalClose();
                this.loadData();
              }}
            />
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderModalUser = (studioProfile: StudioWithRole) => {
    const { showUserModal } = this.state;
    return (
      <IonModal
        cssClass="studio-card-modal"
        isOpen={showUserModal}
        onWillDismiss={() => this.onUserModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {i18n.t('Manage Studio Users')}
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
              typeId={studioProfile.id}
              roleType={RoleType.studio}
              canInsert={canInsertUsers(this.context, RoleType.studio, studioProfile.roleName)}
              canUpdate={canUpdateUsers(this.context, RoleType.studio, studioProfile.roleName)}
              canDelete={canDeleteUsers(this.context, RoleType.studio, studioProfile.roleName)}
              onSave={() => this.loadData()}
              onCancel={() => this.onUserModalClose()}
            />
          )}
        </IonContent>
      </IonModal>
    );
  }

  render() {
    const {
      items, selectedId, isLoading, error, showDeleteAlert,
    } = this.state;
    let studioProfile;
    if (selectedId) {
      studioProfile = items?.find((item) => item.id === selectedId);
    }
    return (
      <>
        <IonCard>
          <IonCardHeader className="studio-card-header">
            <IonCardTitle>
              {i18n.t('My Studios')}
            </IonCardTitle>
            <div className="studio-card-header-toolbar">
              {(!!items && items.length > 0) && (
                <>
                  <IonSelect
                    slot="end"
                    value={selectedId}
                    placeholder={i18n.t('Select Studio')}
                    title={i18n.t('Select Studio')}
                    className="studio-card-header-toolbar-select"
                    interfaceOptions={{
                      header: i18n.t('Select Studio'),
                    }}
                    disabled={isLoading || !!error}
                    onIonChange={(e) => this.setMountedState({ selectedId: e.detail.value })}
                  >
                    {sortByKey(items, 'title').map((item) => (
                      <IonSelectOption key={item.id} value={item.id}>
                        {item.title}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  <IonButtons className="studio-card-header-toolbar-buttons">
                    {!!studioProfile && (
                      <>
                        <IonButton
                          fill="clear"
                          color="primary"
                          title={i18n.t('Manage Studio Users')}
                          disabled={!canReadUsers(this.context, RoleType.studio, studioProfile.roleName)}
                          onClick={() => this.onUserModalOpen()}
                        >
                          <IonIcon icon={people} ariaLabel={i18n.t('Manage Studio Users')} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="primary"
                          title={i18n.t('Edit Studio')}
                          disabled={!canUpdateStudio(this.context, studioProfile.roleName)}
                          onClick={() => this.onStudioModalOpen(selectedId)}
                        >
                          <IonIcon icon={createOutline} ariaLabel={i18n.t('Edit Studio')} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="danger"
                          title={i18n.t('Delete Studio')}
                          disabled={!canDeleteStudio(this.context, studioProfile.roleName)}
                          onClick={() => this.setMountedState({ showDeleteAlert: true })}
                        >
                          <IonIcon icon={trashOutline} ariaLabel={i18n.t('Delete Studio')} />
                        </IonButton>
                        <IonAlert
                          isOpen={showDeleteAlert}
                          onDidDismiss={() => this.setMountedState({ showDeleteAlert: false })}
                          header={i18n.t('Deletion Confirmation')}
                          subHeader={studioProfile?.title || ''}
                          message={i18n.t('Are you sure you want to delete this studio?')}
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
                              handler: () => this.onDelete(selectedId),
                            },
                          ]}
                        />
                      </>
                    )}
                    <IonButton
                      type="button"
                      color="primary"
                      fill="clear"
                      title={i18n.t('Add Studio')}
                      onClick={() => this.onStudioModalOpen()}
                    >
                      <IonIcon icon={addOutline} ariaLabel={i18n.t('Add Studio')} />
                    </IonButton>
                  </IonButtons>
                </>
              )}
            </div>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              {this.renderContent()}
            </IonGrid>
          </IonCardContent>
        </IonCard>
        {this.renderModalStudio()}
        {!!studioProfile && (
          this.renderModalUser(studioProfile)
        )}
      </>
    );
  }
}

StudioCard.contextType = AppContext;

export default StudioCard;
