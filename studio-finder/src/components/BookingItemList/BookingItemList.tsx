import React from 'react';
import {
  IonButton, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { Booking, BookingWithUser } from '../../services/api/bookings';
import { BookingItemWithBooking } from '../../services/api/bookingItems';

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
  studioId: number,
  onDelete: (index: number) => void,
  onChange: (item: BookingItemWithBooking, index: number) => void,
  onAdd: () => void,
  isValidEndDate: (item: BookingItemWithBooking) => boolean,
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
    const { studioId, items } = this.props;
    if (prevProps.studioId !== studioId
      || prevProps.items.length !== items.length) {
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
    this.setMountedState({
      items,
      selectedIndex: items.length - 1, // pre-select last item
    });
  }

  // render

  renderSelectedItem = () => {
    const {
      items, studioId, disabled, onDelete, onChange, isValidEndDate,
    } = this.props;
    const { selectedIndex } = this.state;
    const item = items[selectedIndex];
    if (!item) {
      return null;
    }
    return (
      <BookingItemForm
        index={selectedIndex}
        item={item}
        studioId={studioId}
        disabled={disabled}
        onDelete={() => onDelete(selectedIndex)}
        onChange={(updatedItem: BookingItemWithBooking) => onChange(updatedItem, selectedIndex)}
        isValidEndDate={isValidEndDate}
      />
    );
  }

  renderItems = () => {
    const { items, disabled, onAdd } = this.props;
    const { selectedIndex } = this.state;
    return (
      <IonList className="booking-item-list-items">
        {items.map((item, index) => {
          const label = `${index + 1}. ${
            item.inactive ? `(${i18n.t('cancelled')}) ` : ''
          }${
            item.serviceTitle ? `${item.serviceTitle} - ` : ''
          }${item.spaceTitle}`;
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
              <IonLabel>{label}</IonLabel>
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
            <IonIcon slot="start" icon={addOutline} />
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
