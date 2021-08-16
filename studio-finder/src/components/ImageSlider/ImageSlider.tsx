import React from 'react';
import {
  IonSlide, IonSlides,
} from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';

import './ImageSlider.css';

interface Props {
  imageUrls: string[],
}

class ImageSlider extends React.Component<Props> {
  render() {
    const slideOptions = {
      initialSlide: 0,
      slidesPerView: 1,
      autoplay: false,
    };
    const { imageUrls } = this.props;
    return (
      <IonSlides options={slideOptions} pager className="image-slider">
        {imageUrls.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <IonSlide key={index} className="image-slider-slide image-slider-slide-16by9">
            <div
              className="image-slider-item"
              title={i18n.t('Image #{{position}}', { position: index + 1 })}
              style={{ backgroundImage: `url(${item})` }}
            />
          </IonSlide>
        ))}
      </IonSlides>
    );
  }
}

export default ImageSlider;
