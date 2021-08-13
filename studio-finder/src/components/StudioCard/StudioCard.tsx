import React from 'react';
import {
  IonAlert,
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonGrid, IonIcon, IonModal,
  IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  addOutline, closeOutline, createOutline, trashOutline,
} from 'ionicons/icons';

// services
import { deleteStudio, getStudiosByUser, StudioProfile } from '../../services/api/studios';
import i18n from '../../services/i18n/i18n';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import StudioForm from '../StudioForm/StudioForm';
import SpaceList from '../SpaceList/SpaceList';

// context
import AppContext from '../../context/AppContext';

// css
import './StudioCard.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: StudioProfile[] | null,
  selectedId: number,
  showModal: boolean,
  modalSelectedId: number,
  showDeleteAlert: boolean,
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
      showModal: false,
      modalSelectedId: 0,
      showDeleteAlert: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
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
        console.warn('error - loadItems', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  onModalOpen = (modalSelectedId = 0) => {
    this.setMountedState({
      showModal: true,
      modalSelectedId,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModal: false,
    });
  }

  onDelete = (selectedId: number) => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        await deleteStudio(this.context, selectedId);
        this.loadItems();
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
      <div className="studio-card-spacer">
        <SpaceList studioProfile={studioProfile} />
      </div>
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
                onClick={() => this.onModalOpen()}
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
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
        cssClass="studio-card-modal"
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
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
              onClick={() => this.onModalClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showModal && (
            <StudioForm
              id={modalSelectedId}
              onCancel={() => this.onModalClose()}
              onSave={() => {
                this.onModalClose();
                this.loadItems();
              }}
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
                    {items.map((item) => (
                      <IonSelectOption key={item.id} value={item.id}>
                        {item.title}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  <IonButtons className="studio-card-header-toolbar-buttons">
                    {!!selectedId && (
                      <>
                        <IonButton
                          fill="clear"
                          color="primary"
                          title={i18n.t('Edit Studio')}
                          onClick={() => this.onModalOpen(selectedId)}
                        >
                          <IonIcon icon={createOutline} ariaLabel={i18n.t('Edit Studio')} />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="danger"
                          title={i18n.t('Delete Studio')}
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
                      onClick={() => this.onModalOpen()}
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
      </>
    );
  }
}

StudioCard.contextType = AppContext;

export default StudioCard;
