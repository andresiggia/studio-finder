import React from 'react';
import { IonImg, IonSlide, IonSlides } from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';

interface Props {
  imageUrls: string[],
}

class ImageSlider extends React.Component<Props> {
  render() {
    const slideOptions = {
      initialSlide: 0,
      slidesPerView: 1,
      autoplay: true,
    };
    const { imageUrls } = this.props;
    return (
      <IonSlides options={slideOptions} pager>
        {imageUrls.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <IonSlide key={index}>
            <IonImg src={item} alt={i18n.t('Image #{{position}}', { position: index + 1 })} />
          </IonSlide>
        ))}
      </IonSlides>
    );
  }
}

export default ImageSlider;
