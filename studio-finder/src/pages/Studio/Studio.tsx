import React from 'react';
import {
  IonCard, IonCardContent, IonCardHeader, IonCol, IonContent, IonGrid, IonLabel, IonPage, IonRow, IonSpinner,
  IonText, IonCardTitle, IonIcon,
} from '@ionic/react';
import {
  withRouter, RouteComponentProps,
} from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  musicalNote,
} from 'ionicons/icons';

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
import { getSpaces, SpaceProfileDisplay } from '../../services/api/spaces';
import { BookingDate, BookingItem, upsertBookingItem } from '../../services/api/bookingItems';
import { defaultBooking, upsertBooking } from '../../services/api/bookings';

import Space from './Space';
import BookingBar from './BookingBar';

// css
import './Studio.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  studioProfile: StudioProfile | null,
  studioPhotos: StudioPhoto[],
  spaces: SpaceProfileDisplay[],
  selectedSpaceId: number,
  bookingDates: BookingDate[],
}

class Studio extends React.Component<RouteComponentProps, State> {
  mounted = false

  elementRef = React.createRef<HTMLDivElement>()

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      studioProfile: null,
      studioPhotos: [],
      spaces: [],
      selectedSpaceId: 0,
      bookingDates: [],
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
        const spaces = await getSpaces(this.context, {
          studioId: id,
        });
        // eslint-disable-next-line no-console
        console.log('got studio data', {
          studioProfile, studioPhotos, spaces,
        });
        let selectedSpaceId = 0;
        if (spaces.length > 0) {
          selectedSpaceId = spaces[0].id;
        }
        this.setMountedState({
          isLoading: false,
          studioProfile,
          studioPhotos,
          spaces,
          selectedSpaceId,
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

  onBookingConfirm = (bookingItems: BookingItem[], notes: string) => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { studioProfile } = this.state;
        const { state } = this.context;
        const booking = await upsertBooking(this.context, {
          booking: {
            ...defaultBooking,
            userId: state.user.id,
            notes,
          },
          studioId: studioProfile?.id || 0,
        });
        // eslint-disable-next-line no-console
        console.log('created booking', booking);
        const response = await Promise.all(bookingItems.map((bookingItem) => (
          upsertBookingItem(this.context, {
            bookingItem, bookingId: booking.id,
          })
        )));
        // eslint-disable-next-line no-console
        console.log('created booking items', response);
        this.setMountedState({
          isLoading: false,
          bookingDates: [],
        }, () => this.loadData()); // reload data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - onBookingConfirm', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  // render

  renderAbout = () => {
    const { studioProfile } = this.state;
    return (
      <>
        <IonLabel className="studio-page-label">
          {i18n.t('About')}
        </IonLabel>
        {studioProfile?.description && (
          <p className="studio-page-description">{studioProfile.description}</p>
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

  onBookingDateChange = (index: number, item?: BookingDate) => {
    const { bookingDates: _bookingDates } = this.state;
    const bookingDates = _bookingDates.slice();
    if (!item) {
      bookingDates.splice(index, 1);
    } else if (index === -1) {
      bookingDates.push(item);
    } else {
      bookingDates[index] = item;
    }
    this.setMountedState({
      bookingDates,
    });
  }

  renderSelectedSpace = () => {
    const {
      spaces, selectedSpaceId, studioProfile, bookingDates,
    } = this.state;
    const space = spaces.find((item) => item.id === selectedSpaceId);
    if (!selectedSpaceId || !space) {
      return (
        <IonLabel>{`(${i18n.t('No space selected')})`}</IonLabel>
      );
    }
    if (!studioProfile) {
      return null;
    }
    return (
      <Space
        id={space.id}
        studioProfile={studioProfile}
        bookingDates={bookingDates.filter((item) => item.spaceId === space.id)}
        onSelectionChange={this.onBookingDateChange}
      />
    );
  }

  renderSpaces = () => {
    const { spaces, selectedSpaceId } = this.state;
    return (
      <>
        <IonText className="page-subtitle">
          {i18n.t('Spaces')}
        </IonText>
        {spaces.length === 0
          ? (
            <p>{i18n.t('No spaces available')}</p>
          ) : (
            <IonRow>
              <IonCol size="12" size-sm="6" size-md="4" size-lg="3">
                <IonLabel className="studio-page-label">
                  {i18n.t('Select a space')}
                </IonLabel>
                <div className="studio-page-spaces-list">
                  {spaces.map((item) => (
                    <IonCard
                      key={item.id}
                      className={`studio-page-space ${
                        item.id === selectedSpaceId ? 'studio-page-space-selected' : ''
                      }`}
                      button
                      onClick={() => this.setMountedState({ selectedSpaceId: item.id })}
                    >
                      <div
                        className="studio-page-space-photo"
                        style={{ backgroundImage: `url(${item.photoUrl})` }}
                        title={item.photoUrl ? '' : i18n.t('No image to display')}
                      >
                        {!item.photoUrl && (
                          <IonIcon icon={musicalNote} color="light" />
                        )}
                      </div>
                      <IonCardHeader>
                        <IonCardTitle>
                          {item.title}
                        </IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        {item.description}
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
              </IonCol>
              <IonCol size="12" size-sm="6" size-md="8" size-lg="9">
                {this.renderSelectedSpace()}
              </IonCol>
            </IonRow>
          )}
      </>
    );
  }

  renderView = () => {
    const {
      isLoading, error, studioProfile, spaces, bookingDates,
    } = this.state;
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
          <IonCol size="12" size-sm="6">
            {this.renderPhotos()}
          </IonCol>
          <IonCol size="12" size-sm="6">
            {this.renderAbout()}
          </IonCol>
        </IonRow>
        <hr />
        {this.renderSpaces()}
        {bookingDates.length > 0 && (
          <BookingBar
            studioProfile={studioProfile}
            spaces={spaces}
            bookingDates={bookingDates}
            scrollIntoView={() => this.elementRef.current?.scrollIntoView({ behavior: 'smooth' })}
            onConfirmBooking={this.onBookingConfirm}
            onClear={() => this.setMountedState({ bookingDates: [] })}
            onRemove={(bookingItem: BookingItem) => {
              const updatedItems = bookingDates.slice();
              // remove items from back to front to keep same index
              bookingDates.reverse().forEach((item, index) => {
                const reverseIndex = bookingDates.length - index - 1;
                if (item.spaceId === bookingItem.spaceId
                  && item.serviceType === bookingItem.serviceType
                  && !!bookingItem.startAt
                  && item.date.getTime() >= bookingItem.startAt.getTime()
                  && !!bookingItem.endAt
                  && item.date.getTime() <= bookingItem.endAt.getTime()) {
                  updatedItems.splice(reverseIndex, 1);
                }
              });
              this.setMountedState({
                bookingDates: updatedItems,
              });
            }}
          />
        )}
        <div ref={this.elementRef} />
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
