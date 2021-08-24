import React from 'react';
import {
  IonButton, IonButtons, IonContent, IonGrid, IonIcon, IonLabel, IonModal, IonSegment, IonSegmentButton, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  addOutline, closeOutline,
} from 'ionicons/icons';

// services
import { StudioWithRole } from '../../services/api/studios';
import i18n from '../../services/i18n/i18n';
import { canInsertSpace, getSpacesByUser, SpaceWithRole } from '../../services/api/spaces';
import { sortByKey } from '../../services/helpers/misc';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import SpaceForm from '../SpaceForm/SpaceForm';

// context
import AppContext from '../../context/AppContext';

// css
import './SpaceList.css';

import SpaceListItem from './SpaceListItem';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: SpaceWithRole[] | null,
  selectedId: number,
  showModal: boolean,
  modalSelectedId: number,
}

interface Props {
  studioProfile: StudioWithRole,
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
      <SpaceListItem
        spaceProfile={spaceProfile}
        studioProfile={studioProfile}
        onModalOpen={this.onModalOpen}
        reloadItems={this.loadItems}
      />
    );
  }

  renderSpaces = () => {
    const { items, selectedId } = this.state;
    const sortedItems = sortByKey(items || [], 'title');
    if (sortedItems.length === 1) {
      return sortedItems.map((item, index) => (
        <IonLabel
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="space-list-item-title"
        >
          {item.title}
        </IonLabel>
      ));
    }
    return (
      <IonSegment
        value={String(selectedId)}
        scrollable
        onIonChange={(e) => {
          const newValue = Number(e.detail.value);
          this.setMountedState({
            selectedId: newValue || selectedId,
          });
        }}
      >
        {sortedItems.map((item) => (
          <IonSegmentButton
            key={item.id}
            value={String(item.id)}
            title={item.hoverTitle || item.title}
            disabled={item.disabled}
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

  renderContent = () => {
    const { studioProfile } = this.props;
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
        <IonGrid>
          <p>{i18n.t('No spaces found.')}</p>
          <IonButton
            fill="solid"
            color="primary"
            title={i18n.t('Add Space')}
            disabled={!canInsertSpace(this.context, studioProfile.roleName)}
            onClick={() => this.onModalOpen()}
          >
            <IonIcon slot="start" icon={addOutline} />
            {i18n.t('Space')}
          </IonButton>
        </IonGrid>
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
