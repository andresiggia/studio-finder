import React from 'react';
import {
  IonButton, IonCol, IonIcon, IonItem, IonLabel, IonReorder, IonReorderGroup, IonRow, IonList, IonGrid, IonSpinner,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addOutline, trashOutline } from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';
import { Photo } from '../../services/api/photos';
import { deepEqual, getFilename } from '../../services/helpers/misc';

// context
import AppContext from '../../context/AppContext';

// components
import PhotoForm from '../PhotoForm/PhotoForm';

// css
import './PhotoList.css';

interface State {
  selectedIndex: number,
  isReordering: boolean,
}

interface Props {
  items: Photo[],
  files: (File | null)[],
  disabled: boolean,
  onDelete: (index: number) => void,
  onOrderChange: (items: Photo[]) => void,
  onChange: (item: Photo, index: number) => void,
  onFileChange: (file: File | null, index: number) => void,
  onAdd: () => void,
}

class PhotoList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIndex: -1,
      isReordering: false,
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
    let { selectedIndex } = this.state;
    // prevent invalid selection
    if (selectedIndex === -1 && items.length > 0) {
      selectedIndex = 0;
    } else if (selectedIndex >= items.length) {
      selectedIndex = items.length - 1;
    }
    this.setMountedState({
      selectedIndex,
      isReordering: false,
    });
  }

  // render

  renderSelectedItem = () => {
    const {
      items, disabled, files, onChange, onFileChange,
    } = this.props;
    const { selectedIndex } = this.state;
    const item = items[selectedIndex];
    if (!item) {
      return null;
    }
    return (
      <PhotoForm
        item={items[selectedIndex]}
        file={files[selectedIndex]}
        disabled={disabled}
        onChange={(updatedItem: Photo) => onChange(updatedItem, selectedIndex)}
        onFilesChange={(updatedFiles: (File | null)[]) => {
          const file = updatedFiles.length > 0 ? updatedFiles[0] : null;
          // eslint-disable-next-line no-console
          console.log('file changed', file, selectedIndex);
          onFileChange(file, selectedIndex);
        }}
      />
    );
  }

  renderItems = () => {
    const {
      items, files, disabled, onAdd, onOrderChange, onDelete,
    } = this.props;
    const { selectedIndex } = this.state;
    return (
      <IonList className="photo-list-items">
        <IonReorderGroup
          disabled={false}
          onIonItemReorder={(e: any) => {
            const { from, to } = e.detail;
            if (from !== to) {
              // eslint-disable-next-line no-console
              console.log('will reorder items', { from, to }, items);
              const updatedItems = items.slice();
              const [movedItem] = updatedItems.splice(from, 1);
              updatedItems.splice(to, 0, movedItem);
              // eslint-disable-next-line no-console
              console.log('reordered items', updatedItems);
              this.setMountedState({
                selectedIndex: to,
                isReordering: true,
              }, () => onOrderChange(updatedItems));
            }
            e.detail.complete();
          }}
        >
          {items.map((item, index) => {
            let label = `(${i18n.t('empty')})`;
            if (item.photoUrl) {
              label = getFilename(item.photoUrl);
            } else {
              const file = files[index];
              if (file?.name) {
                label = getFilename(file.name);
              }
            }
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
              </IonItem>
            );
          })}
        </IonReorderGroup>
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
    const { selectedIndex, isReordering } = this.state;
    if (isReordering) {
      return (
        <div className="photo-list-loading photo-list-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }

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

PhotoList.contextType = AppContext;

export default PhotoList;
