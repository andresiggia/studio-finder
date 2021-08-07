import React from 'react';
import {
  IonButton, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { Photo } from '../../services/api/photos';
import { deepEqual, sortByKey } from '../../services/helpers/misc';

// context
import AppContext from '../../context/AppContext';

// css
import './PhotoList.css';

interface State {
  selectedIndex: number,
}

interface Props {
  items: Photo[],
  disabled: boolean,
  onDelete: (index: number) => void,
  onChange: (item: Photo, index: number) => void,
  onAdd: () => void,
}

class PhotoList extends React.Component<Props, State> {
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
    const { items } = this.props;
    if (prevProps.items.length !== items.length
      || items.some((item, index) => !deepEqual(item, prevProps.items[index]))) {
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
      selectedIndex: items.length - 1, // pre-select last item
    });
  }

  // render

  renderSelectedItem = () => {
    // const {
    //   items, disabled, onDelete, onChange,
    // } = this.props;
    const { selectedIndex } = this.state;
    return (
      <p>
        {`${'Photo #'}${selectedIndex + 1}`}
        (under development)
      </p>
      // <BookingItemForm
      //   index={selectedIndex}
      //   item={items[selectedIndex]}
      //   studioId={studioProfile.id}
      //   disabled={disabled}
      //   onDelete={() => onDelete(selectedIndex)}
      //   onChange={(item: Photo) => onChange(item, selectedIndex)}
      // />
    );
  }

  renderItems = () => {
    const { items, disabled, onAdd } = this.props;
    const { selectedIndex } = this.state;
    const sortedItems = sortByKey(items, 'order');
    return (
      <IonList className="photo-list-items">
        {sortedItems.map((item, index) => {
          const label = `${index + 1}`;
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
          <p>{i18n.t('No photos found.')}</p>
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

PhotoList.contextType = AppContext;

export default PhotoList;
