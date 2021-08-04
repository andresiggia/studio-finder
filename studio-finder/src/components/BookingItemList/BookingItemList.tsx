import React from 'react';
import {
  IonButton, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceProfile } from '../../services/api/spaces';
import { StudioProfile } from '../../services/api/studios';
import {
  Booking, BookingItemWithBooking, BookingWithUser, defaultBookingItem,
} from '../../services/api/bookings';

// components
import BookingItemForm from '../BookingItemForm/BookingItemForm';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingItemList.css';

interface State {
  items: BookingItemWithBooking[],
  selectedIndex: number,
}

interface Props {
  items: BookingItemWithBooking[],
  disabled: boolean,
  booking: Booking | BookingWithUser,
  spaceProfile: SpaceProfile,
  studioProfile: StudioProfile,
}

class BookingItemList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      items: [],
      selectedIndex: -1,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();
  }

  componentDidUpdate(prevProps: Props) {
    const { spaceProfile } = this.props;
    if (prevProps.spaceProfile.id !== spaceProfile.id) {
      this.updateState();
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

  updateState = () => {
    const { items } = this.props;
    // pre-select first item
    let selectedIndex = -1;
    if (items.length > 0) {
      selectedIndex = 0;
    }
    this.setMountedState({
      items,
      selectedIndex,
    });
  }

  onAdd = () => {
    const { studioProfile, spaceProfile, booking } = this.props;
    const { items } = this.state;
    const { state } = this.context;
    const updatedItems = (items || []).slice();
    updatedItems.push({
      ...defaultBookingItem,
      studioId: studioProfile.id,
      studioTitle: studioProfile.title,
      userId: state.user.id,
      userName: state.user.name,
      userSurname: state.user.surname,
      actId: 0,
      actTitle: '',
      spaceTitle: spaceProfile.title,
      // booking items
      bookingId: booking.id,
      spaceId: spaceProfile.id,
    });
    this.setMountedState({
      items: updatedItems,
      selectedIndex: updatedItems.length - 1,
    });
  }

  // render

  renderSelectedItem = () => {
    const { spaceProfile, studioProfile, disabled } = this.props;
    const { items, selectedIndex } = this.state;
    if (!items) {
      return null;
    }
    return (
      <BookingItemForm
        index={selectedIndex}
        item={items[selectedIndex]}
        spaceProfile={spaceProfile}
        studioProfile={studioProfile}
        disabled={disabled}
        onDelete={() => {
          const updatedItems = items.slice();
          updatedItems.splice(selectedIndex, 1);
          this.setMountedState({
            items: updatedItems,
          });
        }}
        onChange={(item: BookingItemWithBooking) => {
          const updatedItems = items.map((oItem, i) => {
            if (selectedIndex === i) {
              return item;
            }
            return oItem;
          });
          this.setMountedState({
            items: updatedItems,
          });
        }}
      />
    );
  }

  renderItems = () => {
    const { items, selectedIndex } = this.state;
    if (!items) {
      return null;
    }
    return (
      <IonList className="booking-item-list-items">
        {items.map((item, index) => {
          const label = `${index + 1}. ${item.spaceTitle} (${item.serviceTitle})`;
          return (
            <IonItem
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              detail
              button
              color={index === selectedIndex
                ? 'primary'
                : ''}
              onClick={() => this.setMountedState({ selectedIndex: item.id })}
              title={label}
            >
              <IonLabel>
                {label}
              </IonLabel>
            </IonItem>
          );
        })}
        <IonItem
          button
          onClick={() => this.onAdd()}
          title={i18n.t('Add Item')}
        >
          <IonIcon icon={addOutline} />
          <IonLabel>
            {i18n.t('Item')}
          </IonLabel>
        </IonItem>
      </IonList>
    );
  }

  render() {
    const { items, selectedIndex } = this.state;

    if (!items || items.length === 0) {
      return (
        <>
          <p>{i18n.t('No items found.')}</p>
          <IonButton
            fill="solid"
            color="primary"
            title={i18n.t('Add Item')}
            onClick={() => this.onAdd()}
          >
            <IonIcon icon={addOutline} />
            {i18n.t('Item')}
          </IonButton>
        </>
      );
    }

    return (
      <IonGrid>
        <IonRow>
          <IonCol size="6" size-lg="4">
            {this.renderItems()}
          </IonCol>
          <IonCol size="6" size-lg="8">
            {selectedIndex > -1 && (
              this.renderSelectedItem()
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }
}

BookingItemList.contextType = AppContext;

export default BookingItemList;
