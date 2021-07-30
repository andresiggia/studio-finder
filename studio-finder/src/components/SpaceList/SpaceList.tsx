import React from 'react';
import {
  IonButton, IonButtons, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRow,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, closeOutline, createOutline } from 'ionicons/icons';

// services
import { StudioProfile } from '../../services/api/studios';
import i18n from '../../services/i18n/i18n';
import { getSpaces } from '../../services/api/spaces';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import SpaceForm from '../SpaceForm/SpaceForm';

// context
import AppContext from '../../context/AppContext';

// css
import './SpaceList.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: any[] | null,
  selectedId: number,
  showModal: boolean,
  modalSelectedId: number,
}

interface Props {
  studioProfile: StudioProfile,
}

class SpaceList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
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

  componentDidUpdate(prevProps: Props) {
    const { studioProfile } = this.props;
    if (prevProps.studioProfile.id !== studioProfile.id) {
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
        const { studioProfile } = this.props;
        // eslint-disable-next-line no-console
        console.log('will load spaces for studio', studioProfile);
        const items = await getSpaces(this.context, {
          studioId: studioProfile.id,
        });
        // eslint-disable-next-line no-console
        console.log('got spaces', items);
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

  renderSelectedSpace = () => {
    const { items, selectedId } = this.state;
    const spaceProfile = items?.find((item) => item.id === selectedId);
    if (!spaceProfile) {
      return (
        <Notification
          type={NotificationType.danger}
          className="space-list-spacer"
          header={i18n.t('Not found')}
          message={i18n.t('Invalid selected Space')}
          onDismiss={() => this.setMountedState({ selectedId: 0 })}
        />
      );
    }
    return (
      <div className="space-list-item-container">
        <IonToolbar>
          <IonTitle size="small" className="space-list-item-title">
            {spaceProfile.title}
          </IonTitle>
          <IonButtons slot="end" className="space-list-item-toolbar">
            <IonButton
              fill="outline"
              color="primary"
              title={i18n.t('Edit Space')}
              onClick={() => this.onModalOpen(selectedId)}
            >
              <IonIcon icon={createOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <p>{spaceProfile.description || `(${i18n.t('No description')})`}</p>
      </div>
    );
  }

  renderModalSpace = () => {
    const { studioProfile } = this.props;
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {modalSelectedId
              ? i18n.t('Edit Space')
              : i18n.t('Create Space')}
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
            <SpaceForm
              id={modalSelectedId}
              studioProfile={studioProfile}
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

  renderContent = () => {
    const {
      isLoading, error, items, selectedId,
    } = this.state;
    return (
      <>
        {isLoading && (
          <div className="space-list-loading space-list-spacer">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="space-list-spacer"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6" size-lg="4">
              {!items || items.length === 0
                ? (
                  <p>{i18n.t('No spaces found.')}</p>
                ) : (
                  <IonList className="space-list-items">
                    {items.map((item) => (
                      <IonItem
                        key={item.id}
                        detail
                        button
                        color={item.id === selectedId
                          ? 'primary'
                          : ''}
                        onClick={() => this.setMountedState({ selectedId: item.id })}
                        title={item.title}
                      >
                        <IonLabel>
                          {item.title}
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
            </IonCol>
            <IonCol size="12" size-md="6" size-lg="8">
              {!!selectedId && (
                this.renderSelectedSpace()
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </>
    );
  }

  render() {
    return (
      <>
        <IonToolbar>
          <IonTitle size="small" className="space-list-title">
            {i18n.t('Studio Spaces')}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="outline"
              color="primary"
              title={i18n.t('Add Space')}
              onClick={() => this.onModalOpen()}
            >
              <IonIcon icon={addOutline} />
              {i18n.t('Space')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {this.renderContent()}
        {this.renderModalSpace()}
      </>
    );
  }
}

SpaceList.contextType = AppContext;

export default SpaceList;
