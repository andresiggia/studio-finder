import React from 'react';
import {
  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent,
  IonIcon, IonItem, IonLabel, IonList, IonModal, IonRow, IonSpinner, IonTitle, IonToolbar,
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
        this.setMountedState({
          isLoading: false,
          items,
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

  // render

  renderList = (items: StudioProfile[]) => (
    <IonRow>
      <IonCol size="12" size-md="6" size-lg="4">
        <IonList className="studio-list-items">
          {items.map((item) => (
            <IonItem key={item.id}>
              <IonLabel>
                {item.title}
              </IonLabel>
              <IonButton
                slot="end"
                onClick={() => this.onModalOpen(item.id)}
              >
                <IonIcon icon={createOutline} ariaLabel={i18n.t('Edit')} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonCol>
    </IonRow>
  )

  renderContent = () => {
    const { isLoading, error, items } = this.state;
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
        {!!items && (
          items.length === 0
            ? (
              <p>{i18n.t('No items found.')}</p>
            ) : this.renderList(items)
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
                className="studio-list-add-button"
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
