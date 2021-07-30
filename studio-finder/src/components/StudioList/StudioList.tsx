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

// context
import AppContext from '../../context/AppContext';

// css
import './StudioList.css';
import SpaceList from '../SpaceList/SpaceList';

interface State {
  isLoading: boolean,
  error: Error | null,
  studios: StudioProfile[] | null,
  selectedStudioId: number,
  showModalStudio: boolean,
  modalSelectedStudioId: number,
}

class StudioList extends React.Component<any, State> {
  mounted = false

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      studios: null,
      selectedStudioId: 0,
      showModalStudio: false,
      modalSelectedStudioId: 0,
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
        const studios = await getStudios(this.context);
        let selectedStudioId = 0;
        // pre-select first item
        if (studios?.length > 0) {
          selectedStudioId = studios[0].id;
        }
        this.setMountedState({
          isLoading: false,
          studios,
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
      showModalStudio: true,
      modalSelectedStudioId,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModalStudio: false,
    });
  }

  // render

  renderSpaces = () => {
    const { studios, selectedStudioId } = this.state;
    const studioProfile = studios?.find((item) => item.id === selectedStudioId);
    if (!studioProfile) {
      return (
        <Notification
          type={NotificationType.danger}
          className="studio-list-spacer"
          header={i18n.t('Not found')}
          message={i18n.t('Invalid selected studio')}
          onDismiss={() => this.setMountedState({ selectedStudioId: 0 })}
        />
      );
    }
    return (
      <SpaceList studioProfile={studioProfile} />
    );
  }

  renderContent = () => {
    const {
      isLoading, error, studios, selectedStudioId,
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
        {!studios || studios.length === 0
          ? (
            <p>{i18n.t('No studios found.')}</p>
          ) : (
            <>
              <IonToolbar>
                <IonSelect
                  value={selectedStudioId}
                  placeholder={i18n.t('Select')}
                  className="studio-list-select"
                  interfaceOptions={{
                    header: i18n.t('Select a Studio'),
                  }}
                >
                  {studios.map((item) => (
                    <IonSelectOption key={item.id} value={item.id}>
                      {item.title}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                {!!selectedStudioId && (
                  <IonButtons className="studio-list-item-toolbar">
                    <IonButton
                      fill="outline"
                      color="primary"
                      title={i18n.t('Edit Studio')}
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
            </>
          )}
      </>
    );
  }

  renderModalStudio = () => {
    const { showModalStudio, modalSelectedStudioId } = this.state;
    return (
      <IonModal
        isOpen={showModalStudio}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {modalSelectedStudioId
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
          {showModalStudio && (
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
