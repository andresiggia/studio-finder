import React from 'react';
import {
  IonButton, IonChip, IonIcon, IonLabel,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  cloudUpload, closeCircle,
} from 'ionicons/icons';

// services
import i18n from '../../services/i18n/i18n';

// css
import './FileUpload.css';

interface Props {
  files: File[],
  renderFilePreview?: (file: File) => any,
  onChange: (files: File[]) => void,
  accept?: string,
  multiple?: boolean,
}

class FileUpload extends React.Component<Props> {
  fileRef: any = React.createRef()

  onChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const { files, onChange } = this.props;
      const updatedFiles = files.slice();
      const newFiles = e.target.files as FileList;
      for (let i = 0; i < newFiles.length; i += 1) {
        const file = newFiles.item(i);
        if (file) {
          updatedFiles.push(file);
        }
      }
      // eslint-disable-next-line no-console
      console.log('got files', updatedFiles);
      onChange(updatedFiles);
    }
  }

  onRemove = (index: number) => {
    const { files, onChange } = this.props;
    const updatedFiles = files.slice();
    updatedFiles.splice(index, 1);
    onChange(updatedFiles);
  }

  render() {
    const {
      multiple, accept, files, renderFilePreview,
    } = this.props;

    return (
      <div className="file-uploader">
        <input
          type="file"
          ref={this.fileRef}
          multiple={multiple || false}
          accept={accept}
          className="file-uploader-input"
          onChange={this.onChange}
        />
        {(files.length === 0 || multiple) && (
          <IonButton
            color="primary"
            onClick={() => this.fileRef.current.click()}
          >
            <IonIcon slot="start" icon={cloudUpload} />
            {i18n.t('Choose File')}
          </IonButton>
        )}
        {files.map((file, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="file-uploader-item">
            {typeof renderFilePreview === 'function' && (
              renderFilePreview(file)
            )}
            <IonChip
              color="primary"
              title={i18n.t('Remove File')}
              onClick={() => this.onRemove(index)}
            >
              <IonLabel>{file.name}</IonLabel>
              <IonIcon icon={closeCircle} ariaLabel={i18n.t('Remove File')} />
            </IonChip>
          </div>
        ))}
      </div>
    );
  }
}

export default FileUpload;
