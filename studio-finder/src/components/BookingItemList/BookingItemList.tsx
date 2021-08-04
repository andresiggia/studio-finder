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
  Booking, BookingItemWithBooking, BookingWithUser,
} from '../../services/api/bookings';

// components
import BookingItemForm from '../BookingItemForm/BookingItemForm';

// context
import AppContext from '../../context/AppContext';

// css
import './BookingItemList.css';

interface State {
  selectedIndex: number,
}

interface Props {
  items: BookingItemWithBooking[],
  disabled: boolean,
  booking: Booking | BookingWithUser,
  spaceProfile: SpaceProfile,
  studioProfile: StudioProfile,
  onDelete: (index: number) => void,
  onChange: (item: BookingItemWithBooking, index: number) => void,
  onAdd: () => void,
}

class BookingItemList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
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

  // render

  renderSelectedItem = () => {
    const {
      items, spaceProfile, studioProfile, disabled, onDelete, onChange,
    } = this.props;
    const { selectedIndex } = this.state;
    return (
      <BookingItemForm
        index={selectedIndex}
        item={items[selectedIndex]}
        spaceProfile={spaceProfile}
        studioProfile={studioProfile}
        disabled={disabled}
        onDelete={() => onDelete(selectedIndex)}
        onChange={(item: BookingItemWithBooking) => onChange(item, selectedIndex)}
      />
    );
  }

  renderItems = () => {
    const { items, disabled, onAdd } = this.props;
    const { selectedIndex } = this.state;
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
              onClick={() => this.setMountedState({ selectedIndex: index })}
              title={label}
            >
              <IonLabel>
                {label}
              </IonLabel>
            </IonItem>
          );
        })}
        {!disabled && (
          <IonItem
            button
            onClick={() => onAdd()}
            title={i18n.t('Add Item')}
          >
            <IonIcon icon={addOutline} />
            <IonLabel>
              {i18n.t('Item')}
            </IonLabel>
          </IonItem>
        )}
      </IonList>
    );
  }

  render() {
    const { items, onAdd } = this.props;
    const { selectedIndex } = this.state;
    if (items.length === 0) {
      return (
        <>
          <p>{i18n.t('No items found.')}</p>
          <IonButton
            fill="solid"
            color="primary"
            title={i18n.t('Add Item')}
            onClick={() => onAdd()}
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
