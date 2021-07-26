import React from 'react';
import {
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid,
  IonIcon, IonItem, IonLabel, IonList, IonModal, IonRow, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, closeOutline, createOutline } from 'ionicons/icons';

// services
import { getStudios, StudioProfile } from '../../services/api/studio';
import i18n from '../../services/i18n/i18n';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import AppContext from '../../context/AppContext';
import StudioForm from '../StudioForm/StudioForm';

// css
import './StudioList.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: StudioProfile[] | null,
  showModal: boolean,
  modalSelectedStudioId: number,
  selectedStudioId: number,
  spaces: any[] | null,
  selectedSpaceId: number,
}

class StudioList extends React.Component<any, State> {
  mounted = false

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      showModal: false,
      modalSelectedStudioId: 0,
      selectedStudioId: 0,
      spaces: null,
      selectedSpaceId: 0,
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
        const items = await getStudios(this.context);
        let selectedStudioId = 0;
        // pre-select first item
        if (items && items.length > 0) {
          selectedStudioId = items[0].id;
        }
        this.setMountedState({
          isLoading: false,
          items,
          selectedStudioId,
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

  onModalOpen = (modalSelectedStudioId = 0) => {
    this.setMountedState({
      showModal: true,
      modalSelectedStudioId,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModal: false,
    });
  }

  onItemToggle = (studioId: number) => {
    const { selectedStudioId } = this.state;
    this.setMountedState({
      selectedStudioId: studioId === selectedStudioId
        ? 0
        : studioId,
    });
  }

  // render

  renderSpaces = () => {
    const { spaces, selectedSpaceId } = this.state;
    return (
      <>
        <IonTitle size="small">
          {i18n.t('Studio Spaces')}
        </IonTitle>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6" size-lg="4">
              {!spaces || spaces.length === 0
                ? (
                  <p>{i18n.t('No spaces found.')}</p>
                ) : (
                  <IonList className="studio-list-items">
                    {spaces.map((space) => (
                      <IonItem
                        key={space.id}
                        detail
                        button
                        color={space.id === selectedSpaceId
                          ? 'primary'
                          : ''}
                        onClick={() => this.onItemToggle(space.id)}
                        title={space.title}
                      >
                        <IonLabel>
                          {space.title}
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </>
    );
  }

  renderContent = () => {
    const {
      isLoading, error, items, selectedStudioId,
    } = this.state;
    return (
      <>
        {isLoading && (
          <div className="studio-list-loading studio-list-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="studio-list-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        {!items || items.length === 0
          ? (
            <p>{i18n.t('No items found.')}</p>
          ) : (
            <div className="studio-list-item-container">
              <IonToolbar>
                <IonTitle>
                  <IonSelect
                    value={selectedStudioId}
                    className="studio-list-title-header-item"
                    placeholder={i18n.t('Select')}
                    interfaceOptions={{
                      header: i18n.t('Select a Studio'),
                    }}
                  >
                    {items.map((item) => (
                      <IonSelectOption key={item.id} value={item.id}>
                        {item.title}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonTitle>
                {!!selectedStudioId && (
                  <IonButtons slot="end">
                    <IonButton
                      fill="outline"
                      color="primary"
                      title={i18n.t('Edit Profile')}
                      onClick={() => this.onModalOpen(selectedStudioId)}
                    >
                      <IonIcon icon={createOutline} />
                    </IonButton>
                  </IonButtons>
                )}
              </IonToolbar>
              {!!selectedStudioId && (
                this.renderSpaces()
              )}
            </div>
          )}
      </>
    );
  }

  renderModal = () => {
    const { showModal, modalSelectedStudioId } = this.state;
    return (
      <IonModal isOpen={showModal}>
        <IonToolbar>
          <IonTitle>
            {modalSelectedStudioId
              ? i18n.t('Edit Studio Profile')
              : i18n.t('Create Studio Profile')}
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
              id={modalSelectedStudioId}
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
    return (
      <>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonButton
                type="button"
                fill="solid"
                color="primary"
                className="studio-list-title-header-item"
                title={i18n.t('Add')}
                onClick={() => this.onModalOpen()}
              >
                <IonIcon icon={addOutline} />
              </IonButton>
              {i18n.t('My Studios')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {this.renderContent()}
          </IonCardContent>
        </IonCard>
        {this.renderModal()}
      </>
    );
  }
}

StudioList.contextType = AppContext;

export default StudioList;
