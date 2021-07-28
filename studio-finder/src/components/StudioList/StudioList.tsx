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
import { getSpaces } from '../../services/api/space';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import StudioForm from '../StudioForm/StudioForm';

// context
import AppContext from '../../context/AppContext';

// css
import './StudioList.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  studios: StudioProfile[] | null,
  selectedStudioId: number,
  showModalStudio: boolean,
  modalSelectedStudioId: number,
  spaces: any[] | null,
  selectedSpaceId: number,
  showModalSpace: boolean,
  modalSelectedSpaceId: number,
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
        const studios = await getStudios(this.context);
        const spaces = await getSpaces(this.context);
        let selectedStudioId = 0;
        let selectedSpaceId = 0;
        // pre-select first item
        if (studios?.length > 0) {
          selectedStudioId = studios[0].id;
          if (selectedStudioId && spaces?.length > 0) {
            const studioSpaces = spaces.filter((space) => space.studioId === selectedStudioId);
            // pre-select first space
            if (studioSpaces?.length > 0) {
              selectedSpaceId = studioSpaces[0].id;
            }
          }
        }
        this.setMountedState({
          isLoading: false,
          studios,
          selectedStudioId,
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

  onModalStudioOpen = (modalSelectedStudioId = 0) => {
    this.setMountedState({
      showModalStudio: true,
      modalSelectedStudioId,
    });
  }

  onModalStudioClose = () => {
    this.setMountedState({
      showModalStudio: false,
    });
  }

  onModalSpaceOpen = (modalSelectedSpaceId = 0) => {
    this.setMountedState({
      showModalSpace: true,
      modalSelectedSpaceId,
    });
  }

  onModalSpaceClose = () => {
    this.setMountedState({
      showModalSpace: false,
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
                  <IonList className="studio-list-studios">
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
                    {studios.map((item) => (
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
                      title={i18n.t('Edit Studio')}
                      onClick={() => this.onModalStudioOpen(selectedStudioId)}
                    >
                      <IonIcon icon={createOutline} />
                      {i18n.t('Studio')}
                    </IonButton>
                    <IonButton
                      fill="outline"
                      color="primary"
                      title={i18n.t('Add Space')}
                      onClick={() => this.onModalSpaceOpen()}
                    >
                      <IonIcon icon={addOutline} />
                      {i18n.t('Space')}
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

  renderModalSpace = () => {
    const { showModalSpace, modalSelectedSpaceId } = this.state;
    return (
      <IonModal
        isOpen={showModalSpace}
        onWillDismiss={() => this.onModalSpaceClose()}
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
              onClick={() => this.onModalSpaceClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showModalSpace && (
            // <StudioForm
            //   id={modalSelectedSpaceId}
            //   onCancel={() => this.onModalSpaceClose()}
            //   onSave={() => {
            //     this.onModalSpaceClose();
            //     this.loadItems();
            //   }}
            // />
            <p>Under development</p>
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderModalStudio = () => {
    const { showModalStudio, modalSelectedStudioId } = this.state;
    return (
      <IonModal
        isOpen={showModalStudio}
        onWillDismiss={() => this.onModalStudioClose()}
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
              onClick={() => this.onModalStudioClose()}
            >
              <IonIcon icon={closeOutline} ariaLabel={i18n.t('Close')} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonContent>
          {showModalStudio && (
            <StudioForm
              id={modalSelectedStudioId}
              onCancel={() => this.onModalStudioClose()}
              onSave={() => {
                this.onModalStudioClose();
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
                onClick={() => this.onModalStudioOpen()}
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
        {this.renderModalSpace()}
      </>
    );
  }
}

StudioList.contextType = AppContext;

export default StudioList;
