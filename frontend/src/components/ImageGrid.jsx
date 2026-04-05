import React from 'react';
import '../styles/ImageGrid.css';

const ImageGrid = ({ images = [], loading = true }) => {
  const skeletonCount = 12;

  // --- DEMO MODE MOCK DATA ---
  // If we are in demo mode and there's no data, show some placeholders
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
  const displayImages = (isDemo && images.length === 0) ? [
    { imageId: 'd1', downloadUrl: 'https://picsum.photos/400/300?random=1', s3Key: 'demo/fsu-campus.jpg', Labels: ['University', 'Building'] },
    { imageId: 'd2', downloadUrl: 'https://picsum.photos/400/300?random=2', s3Key: 'demo/florida-sunset.png', Labels: [] }, // Will show as Untagged
    { imageId: 'd3', downloadUrl: 'https://picsum.photos/400/300?random=3', s3Key: 'demo/coding-session.jpg', Labels: ['Laptop', 'Code'] }
  ] : images;

  if (loading && !isDemo) {
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
      {displayImages.map((image) => {
        // 1. Clean up the filename (removes the "uploads/user-id/" prefix)
        const friendlyName = image.s3Key ? image.s3Key.split('/').pop() : "Unnamed Image";

        // 2. Fix the Label Logic
        // We check if Labels exists and has actual data inside
        const hasLabels = image.Labels && image.Labels.length > 0 && image.Labels[0] !== 'Pending Analysis';

        return (
          <div key={image.imageId} className="image-card">
            <div className="image-container">
              <img src={image.downloadUrl} alt={friendlyName} loading="lazy" />
            </div>
            <div className="image-info">
              <p className="image-name" title={friendlyName}>{friendlyName}</p>
              
              <div className="image-tags">
                {hasLabels ? (
                  // Assuming labels come back as strings or arrays like ["99.9", "Tag"]
                  image.Labels.map((label, idx) => (
                    <span key={idx} className="tag-pill">
                      {Array.isArray(label) ? label[1] : label}
                    </span>
                  ))
                ) : (
                  <span className="tag-pill untagged">Untagged</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImageGrid;