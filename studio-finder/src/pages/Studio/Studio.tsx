import React from 'react';
import {
  IonCol,
  IonContent, IonGrid, IonLabel, IonPage, IonRow, IonSpinner, IonText,
} from '@ionic/react';
import {
  withRouter, RouteComponentProps,
} from 'react-router-dom';

// context
import AppContext from '../../context/AppContext';

// components
import Header from '../../components/Header/Header';
import Notification, { NotificationType } from '../../components/Notification/Notification';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

// services
import i18n from '../../services/i18n/i18n';
import { getStudio, StudioProfile } from '../../services/api/studios';
import { getStudioPhotos, StudioPhoto } from '../../services/api/studioPhotos';

// css
import './Studio.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  studioProfile: StudioProfile | null,
  studioPhotos: StudioPhoto[],
}

class Studio extends React.Component<RouteComponentProps, State> {
  mounted = false

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      studioProfile: null,
      studioPhotos: [],
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: RouteComponentProps) {
    if (this.getId(prevProps) !== this.getId(this.props)) {
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

  getId = (props = this.props) => {
    const { match } = props;
    const { id = '' } = match.params as { id?: string };
    return Number(id || 0);
  }

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const id = this.getId();
        // eslint-disable-next-line no-console
        console.log('loading studio data...', id);
        const studioProfile = await getStudio(this.context, id);
        const studioPhotos = await getStudioPhotos(this.context, { studioId: id });
        this.setMountedState({
          isLoading: false,
          studioProfile,
          studioPhotos,
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
    const { studioProfile } = this.state;
    return (
      <>
        <IonLabel className="studio-page-label">
          {i18n.t('About')}
        </IonLabel>
        {studioProfile?.description && (
          <p>{studioProfile.description}</p>
        )}
      </>
    );
  }

  renderPhotos = () => {
    const { studioPhotos } = this.state;
    return (
      <>
        <IonLabel className="studio-page-label">
          {i18n.t('Photos')}
        </IonLabel>
        {studioPhotos.length === 0
          ? (
            <p>{i18n.t('No photos available')}</p>
          ) : (
            <ImageSlider imageUrls={studioPhotos.map((item) => item.photoUrl)} />
          )}
      </>
    );
  }

  renderView = () => {
    const { isLoading, error, studioProfile } = this.state;
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
    if (!studioProfile) {
      return null;
    }
    return (
      <>
        <IonText className="page-title">
          {studioProfile.title}
        </IonText>
        <IonRow>
          <IonCol size="12" size-sm="6" size-md="8">
            {this.renderPhotos()}
          </IonCol>
          <IonCol size="12" size-sm="6" size-md="4">
            {this.renderAbout()}
          </IonCol>
        </IonRow>
      </>
    );
  }

  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <Header />
          <IonGrid>
            {this.renderView()}
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}

Studio.contextType = AppContext;

export default withRouter(Studio);
