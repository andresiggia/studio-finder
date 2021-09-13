import React from 'react';
import {
  IonAlert,
  IonButton, IonButtons, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRow,
  IonText, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { closeOutline, checkmark } from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceProfile } from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';
import { BookingDate, BookingItem, defaultBookingItem } from '../../services/api/bookingItems';
import { sortByKey } from '../../services/helpers/misc';
import { RouteName } from '../../services/routes/routes';
import { UserType } from '../../services/api/users';

// components
import LoginForm from '../../components/LoginForm/LoginForm';

import BookingBarItem from './BookingBarItem';

// css
import './BookingBar.css';

interface Props {
  studioProfile: StudioProfile,
  spaces: SpaceProfile[],
  bookingDates: BookingDate[],
  onRemove: (bookingItem: BookingItem) => void,
  onClear: () => void,
  onConfirmBooking: (bookingItems: BookingItem[], notes: string) => void,
  scrollIntoView: () => void,
}

interface State {
  showModal: boolean,
  showPaymentAlert: boolean,
  notes: string,
}

class BookingBar extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
      showPaymentAlert: false,
      notes: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { scrollIntoView } = this.props;
    scrollIntoView();
  }

  componentWillUnmount() {
    this.setMountedState({
      showModal: false,
      showPaymentAlert: false,
    });
    this.mounted = false;
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  getQuantity = (endAt: Date, startAt: Date) => (
    (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)
  )

  getBookingItems = () => {
    const { bookingDates } = this.props;
    const sortedItems = sortByKey(bookingDates.map((item) => ({
      ...item,
      timestamp: item.date.getTime(),
    })), 'timestamp');
    const DEFAULT_PERIOD_MODULE_MS = 1000 * 60 * 30; // 30min
    const bookingItems: BookingItem[] = [];
    sortedItems.forEach((item) => {
      const index = bookingItems.findIndex((bItem) => (
        item.spaceId === bItem.spaceId
        && item.serviceType === bItem.serviceType
        && bItem.endAt?.getTime() === item.date.getTime()
      ));
      const endAt = new Date(item.date.getTime() + DEFAULT_PERIOD_MODULE_MS);
      if (index === -1) {
        bookingItems.push({
          ...defaultBookingItem,
          spaceId: item.spaceId,
          serviceType: item.serviceType,
          serviceTitle: item.serviceTitle,
          servicePrice: item.servicePrice,
          startAt: item.date,
          endAt,
          quantity: this.getQuantity(endAt, item.date),
        });
      } else {
        bookingItems[index] = {
          ...bookingItems[index],
          endAt,
          quantity: this.getQuantity(endAt, bookingItems[index].startAt || new Date()),
        };
      }
    });
    return bookingItems;
  }

  onModalOpen = () => {
    this.setMountedState({
      showModal: true,
    });
  }

  onModalClose = () => {
    this.setMountedState({
      showModal: false,
    });
  }

  // render

  renderLabel = (label: string, required = false) => (
    <IonLabel position="stacked">
      {`${label} ${required
        ? '*'
        : ''}`}
    </IonLabel>
  )

  renderTextareaInput = ({
    value, disabled = false, required = false, label, fieldName, placeholder,
  }: {
    value: string, disabled?: boolean, required?: boolean, label: string, fieldName: string, placeholder?: string,
  }) => (
    <>
      {this.renderLabel(label, required)}
      <IonTextarea
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onIonChange={(e: any) => {
          this.setMountedState({
            [fieldName]: e.detail.value || '',
          });
        }}
      />
    </>
  )

  renderLoginModal = () => {
    const { showModal } = this.state;
    return (
      <IonModal
        cssClass="booking-bar-modal-login"
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {i18n.t('Log in or sign up to continue')}
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
            <LoginForm
              routeName={RouteName.login}
              userType={UserType.musician}
              onCancel={() => this.onModalClose()}
            />
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderConfirmationModal = (bookingItems: BookingItem[], totalPrice: number) => {
    const { onConfirmBooking } = this.props;
    const { showModal, showPaymentAlert, notes } = this.state;
    // eslint-disable-next-line max-len
    const samplePolicy = 'This is a sample policy. Et has minim elitr intellegat. Mea aeterno eleifend antiopam ad, nam no suscipit quaerendum. At nam minimum ponderum. Est audiam animal molestiae te.';
    return (
      <IonModal
        cssClass="booking-bar-modal"
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {i18n.t('Confirm booking')}
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
            <IonGrid className="booking-bar-modal-grid">
              <IonLabel className="booking-bar-label">
                {i18n.t('Selection')}
              </IonLabel>
              <IonList className="booking-bar-modal-list">
                {this.renderBookingItems(bookingItems)}
                <IonItem color="medium">
                  <IonLabel>
                    <strong>{i18n.t('Total')}</strong>
                  </IonLabel>
                  <IonText>
                    <strong>{`£ ${totalPrice.toFixed(2)}`}</strong>
                  </IonText>
                </IonItem>
                <IonItem>
                  {this.renderTextareaInput({
                    value: notes,
                    fieldName: 'notes',
                    label: i18n.t('Notes'),
                    placeholder: i18n.t('Type any extra information or request to the studio.'),
                  })}
                </IonItem>
              </IonList>
              <div className="booking-bar-modal-spacer" />
              <IonLabel className="booking-bar-label">
                {i18n.t('Cancellation Policy')}
              </IonLabel>
              <p>{samplePolicy}</p>
              <div className="booking-bar-modal-spacer" />
              <IonRow>
                <IonCol size="12" size-md="6">
                  <IonButton
                    color="dark"
                    fill="outline"
                    expand="block"
                    onClick={() => this.onModalClose()}
                  >
                    {i18n.t('Go back')}
                  </IonButton>
                </IonCol>
                <IonCol size="12" size-md="6">
                  <IonButton
                    color="primary"
                    fill="solid"
                    expand="block"
                    onClick={() => this.setMountedState({
                      showPaymentAlert: true,
                    })}
                  >
                    {i18n.t('Make Payment')}
                    <IonIcon slot="end" icon={checkmark} />
                  </IonButton>
                </IonCol>
              </IonRow>
              <IonAlert
                isOpen={showPaymentAlert}
                onDidDismiss={() => this.setMountedState({ showPaymentAlert: false })}
                header={i18n.t('Payment confirmation')}
                subHeader={`£ ${totalPrice.toFixed(2)}`}
                message={i18n.t('Payment successful')}
                buttons={[
                  {
                    text: 'Ok',
                    role: 'cancel',
                    cssClass: 'primary',
                    handler: () => this.setMountedState({
                      showPaymentAlert: false,
                      showModal: false,
                    }, () => onConfirmBooking(bookingItems, notes)),
                  },
                ]}
              />
            </IonGrid>
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderBookingItems = (bookingItems: BookingItem[]) => {
    const { spaces, onRemove } = this.props;
    return (
      bookingItems.map((bookingItem, index) => {
        const spaceProfile = spaces.find((spaceItem) => spaceItem.id === bookingItem.spaceId);
        if (!spaceProfile) {
          return null;
        }
        return (
          <BookingBarItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            bookingItem={bookingItem}
            spaceProfile={spaceProfile}
            onRemove={onRemove}
          />
        );
      })
    );
  }

  render() {
    const { state } = this.context;
    const { onClear } = this.props;
    const bookingItems = this.getBookingItems();
    const totalPrice = bookingItems.map((bookingItem) => bookingItem.quantity * bookingItem.servicePrice)
      .reduce((partialSum, value) => partialSum + value, 0);
    return (
      <div className="booking-bar">
        <IonGrid className="booking-bar-container">
          <IonRow>
            <IonCol size="12" size-md="6" size-lg="8">
              <IonLabel className="booking-bar-label">
                {i18n.t('Booking selection')}
              </IonLabel>
              <IonList className="booking-bar-list">
                {this.renderBookingItems(bookingItems)}
              </IonList>
            </IonCol>
            <IonCol size="12" size-md="6" size-lg="4">
              <IonLabel className="booking-bar-label">
                {i18n.t('Total')}
              </IonLabel>
              <div className="booking-bar-total">
                {`£ ${totalPrice.toFixed(2)}`}
              </div>
              <IonRow>
                <IonCol size="12" size-md="6">
                  <IonButton
                    color="light"
                    fill="outline"
                    expand="block"
                    onClick={() => onClear()}
                  >
                    {i18n.t('Cancel')}
                  </IonButton>
                </IonCol>
                <IonCol size="12" size-md="6">
                  <IonButton
                    color="primary"
                    fill="solid"
                    expand="block"
                    onClick={() => this.onModalOpen()}
                  >
                    {i18n.t('Book')}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
        {state.user
          ? this.renderConfirmationModal(bookingItems, totalPrice)
          : this.renderLoginModal()}
      </div>
    );
  }
}

BookingBar.contextType = AppContext;

export default BookingBar;
