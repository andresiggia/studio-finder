import React from 'react';

// context
import AppContext from '../../context/AppContext';

// services
import { Photo } from '../../services/api/photos';

// components
import ImageInput from '../ImageInput/ImageInput';

// css
import './PhotoForm.css';

interface Props {
  item: Photo,
  file: File | null,
  disabled: boolean,
  onChange: (item: Photo) => void,
  onFilesChange: (file: (File | null)[]) => void,
}

class PhotoForm extends React.Component<Props> {
  isEditing = () => {
    const { item } = this.props;
    return !!item.id;
  }

  onChange = (value: any, fieldName: string) => {
    const { item, onChange } = this.props;
    onChange({
      ...item,
      [fieldName]: value,
    });
  }

  // render

  renderFields = (disabled: boolean) => {
    const { item, file, onFilesChange } = this.props;
    return (
      <ImageInput
        files={[file]}
        imageUrls={[item.photoUrl]}
        disabled={disabled}
        onFilesChange={onFilesChange}
        onImageUrlsChange={(imageUrls: string[]) => {
          const photoUrl = imageUrls.length > 0 ? imageUrls[0] : '';
          this.onChange(photoUrl, 'photoUrl');
        }}
      />
    );
  }

  render() {
    const { disabled, item } = this.props;
    if (!item) {
      return null;
    }
    return (
      <fieldset className="photo-form-fieldset" disabled={disabled}>
        {this.renderFields(disabled)}
      </fieldset>
    );
  }
}

PhotoForm.contextType = AppContext;

export default PhotoForm;
