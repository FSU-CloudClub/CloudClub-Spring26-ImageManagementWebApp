import React from 'react';
import '../styles/ImageGrid.css';

const ImageGrid = ({ images = [], loading = true }) => {
  const skeletonCount = 12;
  
  if (loading) {
    return (
      <div className="image-grid">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="image-card skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="image-grid">
      {images.map((image) => (
        <div key={image.id} className="image-card">
          <img src={image.url} alt={image.name} />
          <div className="image-info">
            <p className="image-name">{image.name}</p>
            <p className="image-tags">{image.tags?.join(', ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
