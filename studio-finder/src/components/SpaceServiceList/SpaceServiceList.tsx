import React from 'react';
import {
  IonButton, IonCol, IonIcon, IonItem, IonLabel, IonReorder, IonRow, IonList, IonGrid,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, trashOutline } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { SpaceService } from '../../services/api/spaceServices';
import { deepEqual } from '../../services/helpers/misc';

// context
import AppContext from '../../context/AppContext';

// components
import SpaceServiceForm from '../SpaceServiceForm/SpaceServiceForm';

// css
import './SpaceServiceList.css';

interface State {
  selectedIndex: number,
}

interface Props {
  items: SpaceService[],
  disabled: boolean,
  onDelete: (index: number) => void,
  onChange: (item: SpaceService, index: number) => void,
  onAdd: () => void,
  isUniqueTitle: (item: SpaceService, index: number) => boolean,
}

class SpaceServiceList extends React.Component<Props, State> {
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
    const {
      items, disabled, onDelete, onChange, isUniqueTitle,
    } = this.props;
    const { selectedIndex } = this.state;
    const item = items[selectedIndex];
    if (!item) {
      return null;
    }
    return (
      <SpaceServiceForm
        index={selectedIndex}
        item={items[selectedIndex]}
        disabled={disabled}
        onChange={(updatedItem: SpaceService) => onChange(updatedItem, selectedIndex)}
        onDelete={() => onDelete(selectedIndex)}
        isUniqueTitle={(sItem: SpaceService) => isUniqueTitle(sItem, selectedIndex)}
      />
    );
  }

  renderItems = () => {
    const {
      items, disabled, onAdd, onDelete,
    } = this.props;
    const { selectedIndex } = this.state;
    return (
      <IonList className="space-service-list-items">
        {items.map((item, index) => {
          const label = `${index + 1}. ${item.title || `(${i18n.t('No title')})`}`;
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
              <IonReorder slot="start" />
              <IonLabel>{label}</IonLabel>
              {
              // index === selectedIndex && (
                <IonButton
                  slot="end"
                  size="small"
                  color={index === selectedIndex
                    ? 'light'
                    : 'danger'}
                  fill="clear"
                  title={i18n.t('Delete Item')}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = index >= selectedIndex
                      ? selectedIndex - 1
                      : selectedIndex;
                    this.setMountedState({
                      selectedIndex: newIndex,
                    }, () => onDelete(index));
                  }}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              }
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
          <p>{i18n.t('No services found.')}</p>
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
        <IonRow style={{ width: '100%' }}>
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

SpaceServiceList.contextType = AppContext;

export default SpaceServiceList;
