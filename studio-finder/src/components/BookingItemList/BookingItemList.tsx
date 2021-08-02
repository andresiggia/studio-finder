import React from 'react';
import {
  IonButton, IonButtons, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRow,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, closeOutline, createOutline } from 'ionicons/icons';

// services
import { SpaceProfile } from '../../services/api/spaces';
import i18n from '../../services/i18n/i18n';
import { getBookingItems } from '../../services/api/bookings';

// components
import Notification, { NotificationType } from '../Notification/Notification';
// import BookingItemForm from '../BookingItemForm/BookingItemForm';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingItemList.css';

interface State {
  isLoading: boolean,
  error: Error | null,
  items: any[] | null,
  // selectedId: number,
  showModal: boolean,
  modalSelectedId: number,
}

interface Props {
  spaceProfile: SpaceProfile,
}

class BookingItemList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      // selectedId: 0,
      showModal: false,
      modalSelectedId: 0,
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
        // eslint-disable-next-line no-console
        console.log('will load bookings for space', spaceProfile);
        const items = await getBookingItems(this.context, {
          spaceId: spaceProfile.id,
        });
        // eslint-disable-next-line no-console
        console.log('got booking items', items);
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

  // renderSelectedBookingItem = () => {
  //   const { items, selectedId } = this.state;
  //   const bookingItemProfile = items?.find((item) => item.id === selectedId);
  //   if (!bookingItemProfile) {
  //     return (
  //       <Notification
  //         type={NotificationType.danger}
  //         className="booking-item-list-bookingItemr"
  //         header={i18n.t('Not found')}
  //         message={i18n.t('Invalid selected BookingItem')}
  //         onDismiss={() => this.setMountedState({ selectedId: 0 })}
  //       />
  //     );
  //   }
  //   return (
  //     <div className="booking-item-list-item-container">
  //       <IonToolbar>
  //         <IonTitle size="small" className="booking-item-list-item-title">
  //           {bookingItemProfile.title}
  //         </IonTitle>
  //         <IonButtons slot="end" className="booking-item-list-item-toolbar">
  //           <IonButton
  //             fill="outline"
  //             color="primary"
  //             title={i18n.t('Edit BookingItem')}
  //             onClick={() => this.onModalOpen(selectedId)}
  //           >
  //             <IonIcon icon={createOutline} />
  //           </IonButton>
  //         </IonButtons>
  //       </IonToolbar>
  //       <p>{bookingItemProfile.description || `(${i18n.t('No description')})`}</p>
  //     </div>
  //   );
  // }

  renderModalBookingItem = () => {
    // const { spaceProfile } = this.props;
    const { showModal, modalSelectedId } = this.state;
    return (
      <IonModal
        isOpen={showModal}
        onWillDismiss={() => this.onModalClose()}
      >
        <IonToolbar>
          <IonTitle>
            {modalSelectedId
              ? i18n.t('Edit BookingItem')
              : i18n.t('Create BookingItem')}
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
            <p>Under development</p>
            // <BookingItemForm
            //   id={modalSelectedId}
            //   spaceProfile={spaceProfile}
            //   onCancel={() => this.onModalClose()}
            //   onSave={() => {
            //     this.onModalClose();
            //     this.loadItems();
            //   }}
            // />
          )}
        </IonContent>
      </IonModal>
    );
  }

  renderContent = () => {
    const {
      isLoading, error, items, // selectedId,
    } = this.state;
    return (
      <>
        {isLoading && (
          <div className="booking-item-list-loading booking-item-list-bookingItemr">
            <IonSpinner name="bubbles" />
          </div>
        )}
        {!!error && (
          <Notification
            type={NotificationType.danger}
            className="booking-item-list-bookingItemr"
            header={i18n.t('Error')}
            message={error?.message || i18n.t('An error occurred, please try again later')}
            onDismiss={() => this.setMountedState({ error: null })}
          />
        )}
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6" size-lg="4">
              {!items || items.length === 0
                ? (
                  <p>{i18n.t('No bookings found.')}</p>
                ) : (
                  <IonList className="booking-item-list-items">
                    {items.map((item, i) => (
                      <IonItem
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        detail
                        button
                        // color={item.id === selectedId
                        //   ? 'primary'
                        //   : ''}
                        onClick={() => this.setMountedState({ selectedId: item.id })}
                        title={item.title}
                      >
                        <IonLabel>
                          {item.title}
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
            </IonCol>
            <IonCol size="12" size-md="6" size-lg="8">
              {/* {!!selectedId && (
                this.renderSelectedBookingItem()
              )} */}
            </IonCol>
          </IonRow>
        </IonGrid>
      </>
    );
  }

  render() {
    return (
      <>
        <IonToolbar>
          <IonTitle size="small" className="booking-item-list-title">
            {i18n.t('Bookings')}
          </IonTitle>
          {/* <IonButtons slot="end">
            <IonButton
              fill="outline"
              color="primary"
              title={i18n.t('Add BookingItem')}
              onClick={() => this.onModalOpen()}
            >
              <IonIcon icon={addOutline} />
              {i18n.t('BookingItem')}
            </IonButton>
          </IonButtons> */}
        </IonToolbar>
        {this.renderContent()}
        {this.renderModalBookingItem()}
      </>
    );
  }
}

BookingItemList.contextType = AppContext;

export default BookingItemList;
