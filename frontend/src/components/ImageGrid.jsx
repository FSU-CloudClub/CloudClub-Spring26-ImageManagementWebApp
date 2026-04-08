import React from 'react';
import '../styles/ImageGrid.css';

/**
 * ImageGrid — pure display component. Receives images from its parent
 * (GalleryScreen) and renders them. No API calls, no demo logic here —
 * that all lives in GalleryScreen and api.js.
 *
 * Props:
 *   images   — array of { imageId, downloadUrl, s3Key, Labels }
 *   loading  — boolean, shows skeleton when true
 *   onDelete — (imageId) => void
 *   onEdit   — (imageId) => void
 */
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
            {images.map((image) => {
                const friendlyName = image.s3Key
                    ? image.s3Key.split('/').pop()
                    : 'Unnamed Image';

                /**
                 * normalizeLabels — returns an array of { name, confidence } objects.
                 * Handles every shape the API might return:
                 *   - ["Dog", "Animal"]              → [{ name: "Dog", confidence: null }, ...]
                 *   - [["Dog", 0.99], ["Cat", 0.87]] → [{ name: "Dog", confidence: 99 }, ...]
                 *   - "Dog, Animal"                  → [{ name: "Dog", confidence: null }, ...]
                 */
                const normalizeLabels = (raw) => {
                    if (!raw) return [];
                    if (typeof raw === 'string') {
                        return raw.split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((name) => ({ name, confidence: null }));
                    }
                    if (Array.isArray(raw)) {
                        return raw
                            .map((l) => Array.isArray(l)
                                ? { name: String(l[0]).trim(), confidence: Math.round(l[1] * 100) }
                                : { name: String(l).trim(), confidence: null }
                            )
                            .filter(({ name }) => name && name !== 'Pending Analysis');
                    }
                    return [];
                };

                const labels = normalizeLabels(image.Labels);
                const hasLabels = labels.length > 0;

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
                                    labels.map(({ name, confidence }, idx) => (
                                        <span key={idx} className="tag-pill">
                                            {name}
                                            {confidence !== null && (
                                                <span style={{ opacity: 0.65, fontSize: '0.75em', marginLeft: 3 }}>
                                                    ({confidence}%)
                                                </span>
                                            )}
                                            {idx < labels.length - 1 && (
                                                <span style={{ marginLeft: 1, opacity: 0.4 }}>,</span>
                                            )}
                                        </span>
                                    ))
                                ) : (
                                    <span className="tag-pill untagged">Untagged</span>
                                )}
                            </div>

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