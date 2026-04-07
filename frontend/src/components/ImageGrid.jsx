import React from 'react';
import '../styles/ImageGrid.css';

const ImageGrid = ({ images = [], loading = true, onDelete, onEdit }) => {
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
    <div className="image-grid animate-fade-in">
      {images.map((image) => (
        <div key={image.id} className="image-card">
          <img src={image.url} alt={image.title || image.name} />

          <div className="image-info">
            <p className="image-name">{image.title || image.name}</p>
            <p className="image-tags">{image.tags?.join(', ')}</p>

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button onClick={() => onEdit(image.id)}>Edit</button>
              <button onClick={() => onDelete(image.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
