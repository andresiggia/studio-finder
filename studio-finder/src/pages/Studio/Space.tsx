import React from 'react';
import {
  IonCol, IonLabel, IonRow, IonSpinner,
} from '@ionic/react';
import {
  withRouter, RouteComponentProps,
} from 'react-router-dom';

// context
import AppContext from '../../context/AppContext';

// components
import Notification, { NotificationType } from '../../components/Notification/Notification';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

// services
import i18n from '../../services/i18n/i18n';
import { getSpace, SpaceProfile } from '../../services/api/spaces';
import { getSpacePhotos, SpacePhoto } from '../../services/api/spacePhotos';

// css
import './Space.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  spaceProfile: SpaceProfile | null,
  spacePhotos: SpacePhoto[],
}

interface Props extends RouteComponentProps {
  id: number,
}

class Space extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      spaceProfile: null,
      spacePhotos: [],
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.loadData();
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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { id } = this.props;
        // eslint-disable-next-line no-console
        console.log('loading space data...', id);
        const spaceProfile = await getSpace(this.context, id);
        const spacePhotos = await getSpacePhotos(this.context, { spaceId: id });
        this.setMountedState({
          isLoading: false,
          spaceProfile,
          spacePhotos,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  renderAbout = () => {
    const { spaceProfile } = this.state;
    return (
      <>
        {spaceProfile?.description && (
          <p>{spaceProfile.description}</p>
        )}
      </>
    );
  }

  renderPhotos = () => {
    const { spacePhotos } = this.state;
    return spacePhotos.length === 0
      ? (
        <p>{i18n.t('No photos available')}</p>
      ) : (
        <ImageSlider imageUrls={spacePhotos.map((item) => item.photoUrl)} />
      );
  }

  renderView = () => {
    const { isLoading, error, spaceProfile } = this.state;
    if (isLoading) {
      return (
        <div className="studio-page-loading studio-page-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }
    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="studio-page-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }
    if (!spaceProfile) {
      return null;
    }
    return (
      <>
        <IonLabel className="studio-page-label">
          {spaceProfile.title}
        </IonLabel>
        <IonRow>
          <IonCol size="12" size-sm="6">
            {this.renderAbout()}
          </IonCol>
          <IonCol size="12" size-sm="6">
            {this.renderPhotos()}
          </IonCol>
        </IonRow>
      </>
    );
  }
}

Space.contextType = AppContext;

export default withRouter(Space);
