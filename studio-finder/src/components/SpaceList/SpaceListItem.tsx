import React from 'react';
import {
  IonAlert,
  IonButton, IonButtons, IonIcon, IonSpinner, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createOutline, trashOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { getSpaceServices } from '../../services/api/spaceServices';
import {
  canDeleteSpace, canUpdateSpace, deleteSpace, SpaceWithRole,
} from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';

// components
import Notification, { NotificationType } from '../Notification/Notification';
import BookingCalendar from '../BookingCalendar/BookingCalendar';
import SpaceServices from '../SpaceServices/SpaceServices';

// context
import AppContext from '../../context/AppContext';

// css
// import './SpaceListItem.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  spaceServices: any[] | null,
  showDeleteAlert: boolean,
}

interface Props {
  spaceProfile: SpaceWithRole,
  studioProfile: StudioProfile,
  onModalOpen: (modalSelectedId?: number) => void,
  reloadItems: () => void,
}

class SpaceListItem extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      spaceServices: null,
      showDeleteAlert: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadItems();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceProfile } = this.props;
    if (prevProps.spaceProfile.id !== spaceProfile.id) {
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
        const { spaceProfile } = this.props;
        const spaceServices = await getSpaceServices(this.context, { spaceId: spaceProfile.id });
        // eslint-disable-next-line no-console
        console.log('got space services', spaceServices);
        this.setMountedState({
          isLoading: false,
          spaceServices,
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

  onDelete = (selectedId: number) => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { reloadItems } = this.props;
        await deleteSpace(this.context, selectedId);
        reloadItems();
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

  render() {
    const { spaceProfile, studioProfile, onModalOpen } = this.props;
    const {
      isLoading, error, spaceServices, showDeleteAlert,
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

    if (!spaceServices || spaceServices.length === 0) {
      return (
        <p>{i18n.t('No services found.')}</p>
      );
    }

    return (
      <>
        <IonToolbar>
          <SpaceServices spaceId={spaceProfile.id} items={spaceServices} />
          <IonButtons slot="end" className="space-list-item-toolbar">
            <IonButton
              fill="clear"
              color="primary"
              title={i18n.t('Edit Space')}
              disabled={!canUpdateSpace(this.context, spaceProfile.roleName)}
              onClick={() => onModalOpen(spaceProfile.id)}
            >
              <IonIcon icon={createOutline} />
            </IonButton>
            <IonButton
              fill="clear"
              color="danger"
              title={i18n.t('Delete Space')}
              disabled={!canDeleteSpace(this.context, spaceProfile.roleName)}
              onClick={() => this.setMountedState({ showDeleteAlert: true })}
            >
              <IonIcon icon={trashOutline} />
            </IonButton>
            <IonAlert
              isOpen={showDeleteAlert}
              onDidDismiss={() => this.setMountedState({ showDeleteAlert: false })}
              header={i18n.t('Deletion Confirmation')}
              subHeader={spaceProfile.title || ''}
              message={i18n.t('Are you sure you want to delete this space?')}
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
                  handler: () => this.onDelete(spaceProfile.id),
                },
              ]}
            />
          </IonButtons>
        </IonToolbar>
        <BookingCalendar
          height={400}
          spaceProfile={spaceProfile}
          studioProfile={studioProfile}
          spaceServices={spaceServices}
          showAddButton={canUpdateSpace(this.context, spaceProfile.roleName)}
          preventEdition={!canUpdateSpace(this.context, spaceProfile.roleName)}
          showPastWeeks
          showBookingDetails
        />
      </>
    );
  }
}

SpaceListItem.contextType = AppContext;

export default SpaceListItem;
