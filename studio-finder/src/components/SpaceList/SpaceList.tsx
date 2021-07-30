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
  spaces: any[] | null,
  selectedSpaceId: number,
  showModalSpace: boolean,
  modalSelectedSpaceId: number,
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
      spaces: null,
      selectedSpaceId: 0,
      showModalSpace: false,
      modalSelectedSpaceId: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentWillUnmount() {
    this.setMountedState({
      showModalStudio: false,
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
        const spaces = await getSpaces(this.context, {
          studioId: studioProfile.id,
        });
        let selectedSpaceId = 0;
        // pre-select first item
        if (spaces?.length > 0) {
          selectedSpaceId = spaces[0].id;
        }
        this.setMountedState({
          isLoading: false,
          spaces,
          selectedSpaceId,
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

  onModalOpen = (modalSelectedSpaceId = 0) => {
    this.setMountedState({
      showModalSpace: true,
      modalSelectedSpaceId,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModalSpace: false,
    });
  }

  onItemToggle = (spaceId: number) => {
    const { selectedSpaceId } = this.state;
    this.setMountedState({
      selectedSpaceId: spaceId === selectedSpaceId
        ? 0
        : spaceId,
    });
  }

  // render

  renderSelectedSpace = () => {
    const { spaces, selectedSpaceId } = this.state;
    const space = spaces?.find((item) => item.id === selectedSpaceId);
    if (!space) {
      return (
        <Notification
          type={NotificationType.danger}
          className="space-list-spacer"
          header={i18n.t('Not found')}
          message={i18n.t('Invalid selected Space')}
          onDismiss={() => this.setMountedState({ selectedSpaceId: 0 })}
        />
      );
    }
    return (
      <div className="space-list-item-container">
        <IonToolbar>
          <IonTitle size="small" className="space-list-item-title">
            {space.title}
          </IonTitle>
          <IonButtons slot="end" className="space-list-item-toolbar">
            <IonButton
              fill="outline"
              color="primary"
              title={i18n.t('Edit Space')}
              onClick={() => this.onModalOpen(selectedSpaceId)}
            >
              <IonIcon icon={createOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <p>{space.description || `(${i18n.t('No description')})`}</p>
      </div>
    );
  }

  renderModalSpace = () => {
    const { studioProfile } = this.props;
    const { showModalSpace, modalSelectedSpaceId } = this.state;
    return (
      <IonModal
        isOpen={showModalSpace}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {modalSelectedSpaceId
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
          {showModalSpace && (
            <SpaceForm
              id={modalSelectedSpaceId}
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
      isLoading, error, spaces, selectedSpaceId,
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
              {!spaces || spaces.length === 0
                ? (
                  <p>{i18n.t('No spaces found.')}</p>
                ) : (
                  <IonList className="space-list-items">
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
            <IonCol size="12" size-md="6" size-lg="8">
              {!!selectedSpaceId && (
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
