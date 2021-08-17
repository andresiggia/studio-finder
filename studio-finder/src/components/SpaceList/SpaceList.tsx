import React from 'react';
import {
  IonButton, IonButtons, IonContent, IonGrid, IonIcon, IonLabel, IonModal, IonSegment, IonSegmentButton,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, closeOutline, createOutline } from 'ionicons/icons';

// services
import { StudioProfile } from '../../services/api/studios';
import i18n from '../../services/i18n/i18n';
import { getSpacesByUser } from '../../services/api/spaces';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import SpaceForm from '../SpaceForm/SpaceForm';
import BookingCalendar from '../BookingCalendar/BookingCalendar';

// context
import AppContext from '../../context/AppContext';

import SpaceServices from './SpaceServices';

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
        const items = await getSpacesByUser(this.context, {
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
    const { studioProfile } = this.props;
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
      <>
        <IonToolbar>
          <p
            slot="start"
            className="space-list-item-description"
            title={spaceProfile.description}
          >
            {spaceProfile.description || `(${i18n.t('No description')})`}
          </p>
          <IonButtons slot="end" className="space-list-item-toolbar">
            <IonButton
              fill="clear"
              color="primary"
              title={i18n.t('Edit Space')}
              onClick={() => this.onModalOpen(selectedId)}
            >
              <IonIcon slot="start" icon={createOutline} />
              {i18n.t('Edit Space')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <SpaceServices spaceId={spaceProfile.id} />
        <BookingCalendar
          spaceProfile={spaceProfile}
          studioProfile={studioProfile}
          showAddButton
          showPastWeeks
          showBookingDetails
        />
      </>
    );
  }

  renderModal = () => {
    const { studioProfile } = this.props;
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
        cssClass="space-list-modal"
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
            <IonGrid>
              <SpaceForm
                id={modalSelectedId}
                studioProfile={studioProfile}
                onCancel={() => this.onModalClose()}
                onSave={() => {
                  this.onModalClose();
                  this.loadItems();
                }}
              />
            </IonGrid>
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderSpaces = () => {
    const { items, selectedId } = this.state;
    const options = [
      ...(items || []),
      {
        id: 0,
        title: i18n.t('Space'),
        hoverTitle: i18n.t('Add Space'),
        icon: addOutline,
      },
    ];
    return (
      <IonSegment
        value={String(selectedId)}
        scrollable
        onIonChange={(e) => {
          const newValue = Number(e.detail.value);
          if (!newValue) {
            this.onModalOpen();
          }
          this.setMountedState({
            selectedId: newValue || selectedId,
          });
        }}
      >
        {options.map((item) => (
          <IonSegmentButton
            key={item.id}
            value={String(item.id)}
            title={item.hoverTitle || item.title}
          >
            {!!item.icon && (
              <IonIcon icon={item.icon} />
            )}
            <IonLabel>{item.title}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>
    );
  }

  renderContent = () => {
    const {
      isLoading, error, items, selectedId,
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

    if (!items || items.length === 0) {
      return (
        <>
          <p>{i18n.t('No spaces found.')}</p>
          <IonButton
            fill="solid"
            color="primary"
            title={i18n.t('Add Space')}
            onClick={() => this.onModalOpen()}
          >
            <IonIcon slot="start" icon={addOutline} />
            {i18n.t('Space')}
          </IonButton>
        </>
      );
    }

    return (
      <>
        {this.renderSpaces()}
        {!!selectedId && (
          this.renderSelectedSpace()
        )}
      </>
    );
  }

  render() {
    return (
      <>
        {this.renderContent()}
        {this.renderModal()}
      </>
    );
  }
}

SpaceList.contextType = AppContext;

export default SpaceList;
