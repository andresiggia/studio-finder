import React from 'react';
import {
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonModal,
  IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, closeOutline, createOutline } from 'ionicons/icons';

// services
import { getStudios, StudioProfile } from '../../services/api/studios';
import i18n from '../../services/i18n/i18n';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import StudioForm from '../StudioForm/StudioForm';
import SpaceList from '../SpaceList/SpaceList';

// context
import AppContext from '../../context/AppContext';

// css
import './StudioList.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: StudioProfile[] | null,
  selectedId: number,
  showModal: boolean,
  modalSelectedId: number,
}

class StudioList extends React.Component<any, State> {
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

  // render

  renderSpaces = () => {
    const { items, selectedId } = this.state;
    const studioProfile = items?.find((item) => item.id === selectedId);
    if (!studioProfile) {
      return (
        <Notification
          type={NotificationType.danger}
          className="studio-list-spacer"
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
            <p>{i18n.t('No studios found.')}</p>
          ) : (
            <>
              <IonToolbar>
                <IonSelect
                  value={selectedId}
                  placeholder={i18n.t('Select')}
                  className="studio-list-select"
                  interfaceOptions={{
                    header: i18n.t('Select a Studio'),
                  }}
                  onIonChange={(e) => this.setMountedState({ selectedId: e.detail.value })}
                >
                  {items.map((item) => (
                    <IonSelectOption key={item.id} value={item.id}>
                      {item.title}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                {!!selectedId && (
                  <IonButtons className="studio-list-item-toolbar">
                    <IonButton
                      fill="outline"
                      color="primary"
                      title={i18n.t('Edit Studio')}
                      onClick={() => this.onModalOpen(selectedId)}
                    >
                      <IonIcon icon={createOutline} />
                      {i18n.t('Edit Studio')}
                    </IonButton>
                  </IonButtons>
                )}
              </IonToolbar>
              {!!selectedId && (
                this.renderSpaces()
              )}
            </>
          )}
      </>
    );
  }

  renderModalStudio = () => {
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
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
    const { items } = this.state;
    return (
      <>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonButton
                type="button"
                color="primary"
                fill={(!items || items.length === 0)
                  ? 'solid'
                  : 'outline'}
                className="studio-list-title-header-item"
                title={i18n.t('Add Studio')}
                onClick={() => this.onModalOpen()}
              >
                <IonIcon icon={addOutline} />
                {i18n.t('Studio')}
              </IonButton>
              {i18n.t('My Studios')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {this.renderContent()}
          </IonCardContent>
        </IonCard>
        {this.renderModalStudio()}
      </>
    );
  }
}

StudioList.contextType = AppContext;

export default StudioList;
