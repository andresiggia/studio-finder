import React from 'react';
import {
  IonButton, IonButtons, IonIcon, IonSpinner, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { getSpaceServices } from '../../services/api/spaceServices';
import { SpaceProfile } from '../../services/api/spaces';
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
}

interface Props {
  spaceProfile: SpaceProfile,
  studioProfile: StudioProfile,
  onModalOpen: (modalSelectedId?: number) => void,
}

class SpaceListItem extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      spaceServices: null,
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

  // render

  render() {
    const { spaceProfile, studioProfile, onModalOpen } = this.props;
    const { isLoading, error, spaceServices } = this.state;

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
              onClick={() => onModalOpen(spaceProfile.id)}
            >
              <IonIcon slot="start" icon={createOutline} />
              {i18n.t('Edit Space')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <SpaceServices spaceId={spaceProfile.id} items={spaceServices} />
        <BookingCalendar
          spaceProfile={spaceProfile}
          studioProfile={studioProfile}
          spaceServices={spaceServices}
          showAddButton
          showPastWeeks
          showBookingDetails
        />
      </>
    );
  }
}

SpaceListItem.contextType = AppContext;

export default SpaceListItem;
