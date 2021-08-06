import React from 'react';
import {
  IonSpinner,
} from '@ionic/react';

// css
import './ImageReader.css';

interface Props {
  file: File,
  renderImage: (imageUrl: string) => any,
}

interface State {
  fileName: string,
  previewUrl: string,
}

class ImageReader extends React.Component<Props, State> {
  mounted = false

  fileReader = new FileReader()

  constructor(props: Props) {
    super(props);
    this.state = {
      fileName: '',
      previewUrl: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();

    this.fileReader.onload = (e: any) => {
      const { file } = this.props;
      const { fileName } = this.state;
      if (file.name === fileName) { // prevent outdated results
        const previewUrl = e.target.result;
        this.setMountedState({
          previewUrl,
        });
      }
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { file } = this.props;
    if (file !== prevProps.file) {
      this.updateState();
    }
  }

  componentWillUnmount() {
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
    const { file } = this.props;
    if (file) {
      this.fileReader.readAsDataURL(file);
    }
    this.setMountedState({
      fileName: file.name,
      previewUrl: '',
    });
  }

  render() {
    const { renderImage } = this.props;
    const { previewUrl } = this.state;

    return (
      <div className="image-reader">
        {!previewUrl
          ? (
            <IonSpinner />
          ) : (
            renderImage(previewUrl)
          )}
      </div>
    );
  }
}

export default ImageReader;
