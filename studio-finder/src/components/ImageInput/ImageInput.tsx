import React from 'react';
import {
  IonButton, IonIcon,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  trashOutline,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';

// components
import FileUpload from '../FileUpload/FileUpload';

import ImageReader from './ImageReader';

// css
import './ImageInput.css';

interface Props {
  files: File[],
  imageUrls: string[],
  multiple?: boolean,
  onFilesChange: (files: File[]) => void,
  onImageUrlsChange: (imageUrls: string[]) => void,
  renderImage?: (imageUrl: string) => any,
}

class ImageInput extends React.Component<Props> {
  onRemoveImageUrl = (index: number) => {
    const { imageUrls, onImageUrlsChange } = this.props;
    const updatedUrls = imageUrls.slice();
    updatedUrls.splice(index, 1);
    onImageUrlsChange(updatedUrls);
  }

  renderImage = (imageUrl: string) => {
    const { renderImage } = this.props;
    if (typeof renderImage === 'function') {
      return renderImage(imageUrl);
    }
    return (
      <img src={imageUrl} alt={i18n.t('Image preview')} />
    );
  }

  render() {
    const {
      multiple, files, imageUrls, onFilesChange,
    } = this.props;

    return (
      <div className="image-input">
        {imageUrls.map((imageUrl, index) => (
          <div className="image-input-photo" key={imageUrl}>
            {this.renderImage(imageUrl)}
            <IonButton
              color="danger"
              fill="clear"
              title={i18n.t('Remove Photo')}
              onClick={() => this.onRemoveImageUrl(index)}
            >
              <IonIcon icon={trashOutline} />
            </IonButton>
          </div>
        ))}
        {(imageUrls.length === 0 || multiple) && (
          <FileUpload
            files={files}
            multiple={multiple}
            accept=".png,.jpg,.jpeg"
            onChange={onFilesChange}
            renderFilePreview={(file) => (
              <ImageReader
                file={file}
                renderImage={this.renderImage}
              />
            )}
          />
        )}
      </div>
    );
  }
}

export default ImageInput;
