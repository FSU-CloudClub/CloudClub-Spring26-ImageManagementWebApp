import React, { useState, useEffect } from 'react';
import { fetchImages } from '../services/api';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

// Matches the same demoImages shape used across the app (imageId, downloadUrl, s3Key, Labels)
const demoImages = [
    {
        imageId: 'd1',
        downloadUrl: 'https://picsum.photos/400/300?random=1',
        s3Key: 'demo/sunset-over-water.jpg',
        Labels: ['Sunset', 'Water', 'Sky', 'Horizon', 'Orange'],
    },
    {
        imageId: 'd2',
        downloadUrl: 'https://picsum.photos/400/300?random=2',
        s3Key: 'demo/mountain-trail.jpg',
        Labels: ['Mountain', 'Nature', 'Trail', 'Trees'],
    },
    {
        imageId: 'd3',
        downloadUrl: 'https://picsum.photos/400/300?random=3',
        s3Key: 'demo/laptop-workspace.jpg',
        Labels: ['Laptop', 'Workspace', 'Desk'],
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyState = () => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem',
        }}
    >
        <div
            style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 24px rgba(79,70,229,0.10)',
            }}
        >
            <i className="bi bi-images" style={{ fontSize: 52, color: '#4f46e5' }} />
        </div>
        <h3 style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '0.5rem' }}>
            No uploads yet
        </h3>
        <p style={{ color: '#6b7280', maxWidth: 360, marginBottom: '1.75rem' }}>
            Your gallery is empty. Upload your first image and SmartGallery will
            automatically tag it using AWS Rekognition.
        </p>
        <a
            href="/upload"
            style={{
                background: 'linear-gradient(90deg, #4f46e5, #0d6efd)',
                borderRadius: 8,
                color: '#fff',
                padding: '0.65rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 12px rgba(79,70,229,0.25)',
                textDecoration: 'none',
            }}
        >
            <i className="bi bi-cloud-upload" />
            Upload your first image
        </a>
    </div>
);

const ErrorState = ({ onRetry }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem',
        }}
    >
        <div
            style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fff1f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 24px rgba(220,38,38,0.10)',
            }}
        >
            <i className="bi bi-wifi-off" style={{ fontSize: 52, color: '#dc2626' }} />
        </div>
        <h3 style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: '0.5rem' }}>
            Something went wrong
        </h3>
        <p style={{ color: '#6b7280', maxWidth: 360, marginBottom: '1.75rem' }}>
            We couldn't reach the server. Check your connection or try again in a moment.
        </p>
        <button
            onClick={onRetry}
            style={{
                background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '0.65rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 12px rgba(220,38,38,0.20)',
            }}
        >
            <i className="bi bi-arrow-clockwise" />
            Try again
        </button>
    </div>
);

const LoadingState = () => (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: 48, height: 48 }}
        >
            <span className="visually-hidden">Loading…</span>
        </div>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>Syncing with AWS…</p>
    </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = ({ user }) => {
    const [images, setImages] = useState(IS_DEMO ? demoImages : []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * loadData — fetches images from the API (real mode) or short-circuits to
     * demoImages (demo mode). Same pattern used in GalleryScreen.
     */
    const loadData = async () => {
        if (IS_DEMO) {
            setImages(demoImages);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const result = await fetchImages();
            setImages(result.images || []);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    if (loading) return <LoadingState />;
    if (error)   return <ErrorState onRetry={loadData} />;
    if (!IS_DEMO && images.length === 0) return <EmptyState />;

    // Derive stats from whichever images are loaded (demo or real)
    // totalUploads — simply the length of the images array returned by the API
    const totalUploads = images.length;
    // totalTags — sum of all Labels arrays across every image
    const totalTags = images.reduce((sum, img) => {
        const labels = Array.isArray(img.Labels) ? img.Labels : [];
        return sum + labels.length;
    }, 0);

    // Friendly username: works for Cognito user objects
    const username = user?.attributes?.email
        ? user.attributes.email.split('@')[0]
        : null;

    return (
        <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>
                    Welcome back{username ? `, ${username}` : ''}
                    {IS_DEMO && (
                        <span
                            style={{
                                marginLeft: 10,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: '#fef9c3',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                                borderRadius: 6,
                                padding: '2px 8px',
                                verticalAlign: 'middle',
                            }}
                        >
                            DEMO
                        </span>
                    )}
                </h2>
                <p style={{ color: '#6b7280', margin: 0 }}>
                    {IS_DEMO
                        ? 'You\'re viewing demo data. Connect AWS to see your real gallery.'
                        : 'Here\'s a quick look at your SmartGallery.'}
                </p>
            </div>

            {/* Stats */}
            <div className="row mb-4">
                {[
                    { icon: 'bi-images',     label: 'Total uploads', value: totalUploads, color: '#4f46e5' },
                    { icon: 'bi-tags',       label: 'Total tags',    value: totalTags,    color: '#16a34a' },
                    { icon: 'bi-bar-chart',  label: 'Avg tags/image',value: totalUploads ? (totalTags / totalUploads).toFixed(1) : 0, color: '#d97706' },
                ].map(({ icon, label, value, color }) => (
                    <div key={label} className="col-12 col-sm-4 mb-3">
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 12,
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: color + '1a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <i className={`bi ${icon}`} style={{ fontSize: 22, color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b4b', lineHeight: 1 }}>
                                    {value}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 2 }}>
                                    {label}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions banner */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #0d6efd 100%)',
                    borderRadius: 14,
                    padding: '1.5rem 2rem',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    boxShadow: '0 4px 20px rgba(79,70,229,0.25)',
                }}
            >
                <div>
                    <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Ready to add more?</h5>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>
                        Upload images and let Rekognition do the tagging.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <a
                        href="/upload"
                        style={{
                            background: '#fff',
                            color: '#4f46e5',
                            borderRadius: 8,
                            padding: '0.55rem 1.25rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            textDecoration: 'none',
                        }}
                    >
                        <i className="bi bi-cloud-upload" /> Upload
                    </a>
                    <a
                        href="/gallery"
                        style={{
                            background: 'transparent',
                            color: '#fff',
                            border: '2px solid rgba(255,255,255,0.6)',
                            borderRadius: 8,
                            padding: '0.55rem 1.25rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            textDecoration: 'none',
                        }}
                    >
                        <i className="bi bi-grid" /> View Gallery
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
// import React, { useState, useEffect } from 'react';
// import { getImages } from '../services/api';

// // Empty State 
// const EmptyState = () => (
//   <div
//     style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '60vh',
//       textAlign: 'center',
//       padding: '2rem',
//     }}
//   >
//     <div
//       style={{
//         width: 120,
//         height: 120,
//         borderRadius: '50%',
//         background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: '1.5rem',
//         boxShadow: '0 4px 24px rgba(79,70,229,0.10)',
//       }}
//     >
//       <i className="bi bi-images" style={{ fontSize: 52, color: '#4f46e5' }} />
//     </div>

//     <h3 style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '0.5rem' }}>
//       No uploads yet
//     </h3>
//     <p style={{ color: '#6b7280', maxWidth: 360, marginBottom: '1.75rem' }}>
//       Your gallery is empty. Upload your first image and SmartGallery will
//       automatically tag it using AWS Rekognition.
//     </p>

//     <a
//       href="/upload"
//       style={{
//         background: 'linear-gradient(90deg, #4f46e5, #0d6efd)',
//         borderRadius: 8,
//         color: '#fff',
//         padding: '0.65rem 1.75rem',
//         fontSize: '1rem',
//         fontWeight: 600,
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: 8,
//         boxShadow: '0 2px 12px rgba(79,70,229,0.25)',
//         textDecoration: 'none',
//       }}
//     >
//       <i className="bi bi-cloud-upload" />
//       Upload your first image
//     </a>
//   </div>
// );

// // API Error State 
// const ErrorState = ({ onRetry }) => (
//   <div
//     style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '60vh',
//       textAlign: 'center',
//       padding: '2rem',
//     }}
//   >
//     <div
//       style={{
//         width: 120,
//         height: 120,
//         borderRadius: '50%',
//         background: 'linear-gradient(135deg, #fee2e2 0%, #fff1f1 100%)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: '1.5rem',
//         boxShadow: '0 4px 24px rgba(220,38,38,0.10)',
//       }}
//     >
//       <i className="bi bi-wifi-off" style={{ fontSize: 52, color: '#dc2626' }} />
//     </div>

//     <h3 style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: '0.5rem' }}>
//       Something went wrong
//     </h3>
//     <p style={{ color: '#6b7280', maxWidth: 360, marginBottom: '1.75rem' }}>
//       We couldn't reach the server. Check your connection or try again in a moment.
//     </p>

//     <button
//       onClick={onRetry}
//       style={{
//         background: 'linear-gradient(90deg, #dc2626, #ef4444)',
//         border: 'none',
//         borderRadius: 8,
//         color: '#fff',
//         padding: '0.65rem 1.75rem',
//         fontSize: '1rem',
//         fontWeight: 600,
//         cursor: 'pointer',
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: 8,
//         boxShadow: '0 2px 12px rgba(220,38,38,0.20)',
//       }}
//     >
//       <i className="bi bi-arrow-clockwise" />
//       Try again
//     </button>
//   </div>
// );

// // Loading State 
// const LoadingState = () => (
//   <div style={{ textAlign: 'center', marginTop: '5rem' }}>
//     <div
//       className="spinner-border text-primary"
//       role="status"
//       style={{ width: 48, height: 48 }}
//     >
//       <span className="visually-hidden">Loading…</span>
//     </div>
//     <p style={{ color: '#6b7280', marginTop: '1rem' }}>Syncing with AWS…</p>
//   </div>
// );

// // Dashboard 
// const Dashboard = ({ user }) => {
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const result = await getImages();
//       setImages(result);
//     } catch {
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [user]);

//   if (loading) return <LoadingState />;
//   if (error)   return <ErrorState onRetry={loadData} />;
//   if (images.length === 0) return <EmptyState />;

//   // Populated state 
//   const complete   = images.filter((img) => img.status === 'COMPLETE').length;
//   const processing = images.filter((img) => img.status === 'PROCESSING').length;

//   return (
//     <div style={{ padding: '1rem 0' }}>
//       <div style={{ marginBottom: '1.75rem' }}>
//         <h2 style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>
//           Welcome back
//           {user?.attributes?.email ? `, ${user.attributes.email.split('@')[0]}` : ''}
//         </h2>
//         <p style={{ color: '#6b7280', margin: 0 }}>
//           Here's a quick look at your SmartGallery.
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="row mb-4">
//         {[
//           { icon: 'bi-images',          label: 'Total uploads', value: images.length, color: '#4f46e5' },
//           { icon: 'bi-check-circle',    label: 'Tagged',        value: complete,      color: '#16a34a' },
//           { icon: 'bi-hourglass-split', label: 'Processing',    value: processing,    color: '#d97706' },
//         ].map(({ icon, label, value, color }) => (
//           <div key={label} className="col-12 col-sm-4 mb-3">
//             <div
//               style={{
//                 background: '#fff',
//                 borderRadius: 12,
//                 padding: '1.25rem 1.5rem',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 16,
//                 boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
//               }}
//             >
//               <div
//                 style={{
//                   width: 48,
//                   height: 48,
//                   borderRadius: '50%',
//                   background: color + '1a',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//               >
//                 <i className={`bi ${icon}`} style={{ fontSize: 22, color }} />
//               </div>
//               <div>
//                 <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b4b', lineHeight: 1 }}>
//                   {value}
//                 </div>
//                 <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 2 }}>{label}</div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick actions banner */}
//       <div
//         style={{
//           background: 'linear-gradient(135deg, #4f46e5 0%, #0d6efd 100%)',
//           borderRadius: 14,
//           padding: '1.5rem 2rem',
//           color: '#fff',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           flexWrap: 'wrap',
//           gap: 16,
//           boxShadow: '0 4px 20px rgba(79,70,229,0.25)',
//         }}
//       >
//         <div>
//           <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Ready to add more?</h5>
//           <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>
//             Upload images and let Rekognition do the tagging.
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//           <a
//             href="/upload"
//             style={{
//               background: '#fff',
//               color: '#4f46e5',
//               borderRadius: 8,
//               padding: '0.55rem 1.25rem',
//               fontWeight: 600,
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: 6,
//               textDecoration: 'none',
//             }}
//           >
//             <i className="bi bi-cloud-upload" /> Upload
//           </a>
//           <a
//             href="/gallery"
//             style={{
//               background: 'transparent',
//               color: '#fff',
//               border: '2px solid rgba(255,255,255,0.6)',
//               borderRadius: 8,
//               padding: '0.55rem 1.25rem',
//               fontWeight: 600,
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: 6,
//               textDecoration: 'none',
//             }}
//           >
//             <i className="bi bi-grid" /> View Gallery
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
