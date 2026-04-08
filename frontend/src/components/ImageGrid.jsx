import React from 'react';
import '../styles/ImageGrid.css';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const ImageGrid = ({ images = [], loading = true, onDelete, onEdit }) => {
    const skeletonCount = 12;

    // -------------------------------------------------------------------------
    // Loading skeleton — always show it when loading is true
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // In demo mode, if no images were passed fall back to built-in placeholders.
    // In real mode, an empty array just means no images — handled by GalleryScreen.
    // -------------------------------------------------------------------------
    const displayImages =
        IS_DEMO && images.length === 0
            ? [
                  {
                      imageId: 'd1',
                      downloadUrl: 'https://picsum.photos/400/300?random=1',
                      s3Key: 'demo/sunset-over-water.jpg',
                      Labels: ['Sunset', 'Water'],
                  },
                  {
                      imageId: 'd2',
                      downloadUrl: 'https://picsum.photos/400/300?random=2',
                      s3Key: 'demo/mountain-trail.jpg',
                      Labels: [],
                  },
                  {
                      imageId: 'd3',
                      downloadUrl: 'https://picsum.photos/400/300?random=3',
                      s3Key: 'demo/laptop-workspace.jpg',
                      Labels: ['Laptop', 'Code'],
                  },
              ]
            : images;

    // -------------------------------------------------------------------------
    // Render grid
    // -------------------------------------------------------------------------
    return (
        <div className="image-grid animate-fade-in">
            {displayImages.map((image) => {
                const friendlyName = image.s3Key
                    ? image.s3Key.split('/').pop()
                    : 'Unnamed Image';

                const hasLabels =
                    image.Labels &&
                    image.Labels.length > 0 &&
                    image.Labels[0] !== 'Pending Analysis';

                return (
                    <div key={image.imageId} className="image-card">
                        <div className="image-container">
                            <img
                                src={image.downloadUrl}
                                alt={friendlyName}
                                loading="lazy"
                            />
                        </div>

                        <div className="image-info">
                            <p className="image-name" title={friendlyName}>
                                {friendlyName}
                            </p>

                            <div className="image-tags">
                                {hasLabels ? (
                                    image.Labels.map((label, idx) => (
                                        <span key={idx} className="tag-pill">
                                            {Array.isArray(label) ? label[1] : label}
                                        </span>
                                    ))
                                ) : (
                                    <span className="tag-pill untagged">Untagged</span>
                                )}
                            </div>

                            {/* Action buttons — styled to match the app, not bare HTML */}
                            <div className="image-actions">
                                <button
                                    className="btn btn-outline-primary btn-xs"
                                    onClick={() => onEdit && onEdit(image.imageId)}
                                    title="Rename image"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-xs"
                                    onClick={() => onDelete && onDelete(image.imageId)}
                                    title="Delete image"
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ImageGrid;

// import React from 'react';
// import '../styles/ImageGrid.css';

// const ImageGrid = ({ images = [], loading = true, onDelete, onEdit }) => {
//   const skeletonCount = 12;

//   // --- DEMO MODE MOCK DATA ---
//   // If we are in demo mode and there's no data, show some placeholders
//   const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
//   const displayImages = (isDemo && images.length === 0) ? [
//     { imageId: 'd1', downloadUrl: 'https://picsum.photos/400/300?random=1', s3Key: 'demo/fsu-campus.jpg', Labels: ['University', 'Building'] },
//     { imageId: 'd2', downloadUrl: 'https://picsum.photos/400/300?random=2', s3Key: 'demo/florida-sunset.png', Labels: [] }, // Will show as Untagged
//     { imageId: 'd3', downloadUrl: 'https://picsum.photos/400/300?random=3', s3Key: 'demo/coding-session.jpg', Labels: ['Laptop', 'Code'] }
//   ] : images;

//   if (loading && !isDemo) {
//     return (
//       <div className="image-grid">
//         {Array.from({ length: skeletonCount }).map((_, index) => (
//           <div key={index} className="image-card skeleton">
//             <div className="skeleton-image"></div>
//             <div className="skeleton-text"></div>
//             <div className="skeleton-text short"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }
// return (
//   <div className="image-grid animate-fade-in">
//     {displayImages.map((image) => {
//       const friendlyName = image.s3Key ? image.s3Key.split('/').pop() : "Unnamed Image";
//       const hasLabels = image.Labels && image.Labels.length > 0 && image.Labels[0] !== 'Pending Analysis';

//       return (
//         <div key={image.imageId} className="image-card">
//           <div className="image-container">
//             <img src={image.downloadUrl} alt={friendlyName} loading="lazy" />
//           </div>
//           <div className="image-info">
//             <p className="image-name" title={friendlyName}>{friendlyName}</p>
//             <div className="image-tags">
//               {hasLabels ? (
//                 image.Labels.map((label, idx) => (
//                   <span key={idx} className="tag-pill">
//                     {Array.isArray(label) ? label[1] : label}
//                   </span>
//                 ))
//               ) : (
//                 <span className="tag-pill untagged">Untagged</span>
//               )}
//             </div>
//             <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
//               <button onClick={() => onEdit(image.imageId)}>Edit</button>
//               <button onClick={() => onDelete(image.imageId)}>Delete</button>
//             </div>
//           </div>
//         </div>
//       );
//     })}
//   </div>  
//   );
// }
// export default ImageGrid;