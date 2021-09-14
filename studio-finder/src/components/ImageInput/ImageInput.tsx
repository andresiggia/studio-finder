import React from 'react';

// services
import i18n from '../../services/i18n/i18n';

// components
import FileUpload from '../FileUpload/FileUpload';

import ImageReader from './ImageReader';

// css
import './ImageInput.css';
import Filename from '../Filename/Filename';

interface Props {
  files: (File | null)[],
  imageUrls: string[],
  disabled?: boolean,
  multiple?: boolean,
  onFilesChange: (files: (File | null)[]) => void,
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
      <div
        className="image-input-preview"
        title={i18n.t('Image preview')}
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  render() {
    const {
      multiple, files, imageUrls, disabled, onFilesChange,
    } = this.props;
    const validImages = imageUrls.filter((imageUrl) => !!imageUrl);
    const validFiles = files.filter((file) => !!file) as File[];

    return (
      <div className="image-input">
        {validImages.map((imageUrl, index) => (
          <div className="image-input-photo" key={imageUrl}>
            {this.renderImage(imageUrl)}
            <Filename
              title={i18n.t('Remove Photo')}
              disabled={disabled}
              onRemove={() => this.onRemoveImageUrl(index)}
              name={imageUrl}
            />
          </div>
        ))}
        {(validImages.length === 0 || multiple) && (
          <FileUpload
            files={validFiles}
            multiple={multiple}
            disabled={disabled}
            accept=".png,.jpg,.jpeg"
            onChange={onFilesChange}
            renderFilePreview={(file) => {
              if (!file) {
                return null;
              }
              return (
                <ImageReader
                  file={file}
                  renderImage={this.renderImage}
                />
              );
            }}
          />
        )}
      </div>
    );
  }
}

export default ImageInput;
