import React, { useState, useEffect } from 'react';

import ImageGrid from '../components/ImageGrid';
import { fetchImages } from '../services/api';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

// Field names match exactly what ImageGrid expects:
// imageId, downloadUrl, s3Key, Labels
const demoImages = [
    {
        imageId: 'd1',
        downloadUrl: 'https://picsum.photos/400/300?random=1',
        s3Key: 'demo/sunset-over-water.jpg',
        Labels: ['Sunset', 'Water']
    },
    {
        imageId: 'd2',
        downloadUrl: 'https://picsum.photos/400/300?random=2',
        s3Key: 'demo/mountain-trail.jpg',
        Labels: ['Mountain', 'Nature']
    },
    {
        imageId: 'd3',
        downloadUrl: 'https://picsum.photos/400/300?random=3',
        s3Key: 'demo/laptop-workspace.jpg',
        Labels: ['Laptop', 'Workspace']
    }
];

const GalleryScreen = ({ user, signOut }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // In demo mode, seed state with demoImages immediately.
    // In real mode, start empty — useEffect will populate via API.
    const [images, setImages] = useState(IS_DEMO ? demoImages : []);

    // ---------------------------------------------------------------------------
    // Delete & Edit
    // In demo mode: purely local state changes. "Reset Demo" restores originals.
    // In real mode: call the API then update state to reflect the change.
    // ---------------------------------------------------------------------------

    const handleDelete = async (imageId) => {
        if (IS_DEMO) {
            // Local-only delete — wiped when user clicks "Reset Demo"
            setImages((prev) => prev.filter((img) => img.imageId !== imageId));
            return;
        }
        try {
            // TODO: await deleteImage(imageId);  <- plug in your real API call
            setImages((prev) => prev.filter((img) => img.imageId !== imageId));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Could not delete image. Please try again.');
        }
    };

    const handleEdit = async (imageId) => {
        const newName = window.prompt('Enter a new file name:');
        if (!newName) return;

        if (IS_DEMO) {
            // Local-only edit — wiped when user clicks "Reset Demo"
            setImages((prev) =>
                prev.map((img) =>
                    img.imageId === imageId
                        ? { ...img, s3Key: `demo/${newName}` }
                        : img
                )
            );
            return;
        }
        try {
            // TODO: await renameImage(imageId, newName);  <- plug in your real API call
            setImages((prev) =>
                prev.map((img) =>
                    img.imageId === imageId
                        ? { ...img, s3Key: newName }
                        : img
                )
            );
        } catch (err) {
            console.error('Edit failed:', err);
            alert('Could not rename image. Please try again.');
        }
    };

    // ---------------------------------------------------------------------------
    // Refresh Images (demo mode) — shows skeleton briefly, then puts back whatever
    // the user currently has. Does NOT restore deleted/edited images.
    // ---------------------------------------------------------------------------
    const handleDemoRefresh = () => {
        setImages((current) => {
            const snapshot = current; // capture state before the skeleton
            setLoading(true);
            setTimeout(() => {
                setImages(snapshot);
                setLoading(false);
            }, 1200);
            return current; // no change yet
        });
    };

    // ---------------------------------------------------------------------------
    // Reset Demo — shows skeleton briefly, then restores the original demo images.
    // Wipes any edits or deletes made this session.
    // ---------------------------------------------------------------------------
    const handleDemoReset = () => {
        setLoading(true);
        setTimeout(() => {
            setImages(demoImages);
            setLoading(false);
        }, 1200);
    };

    // ---------------------------------------------------------------------------
    // Refresh Images (real mode) — re-fetches from the API.
    // Edits/deletes made this session that weren't persisted to the backend will
    // be lost, which is correct behaviour.
    // ---------------------------------------------------------------------------
    const handleRealRefresh = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await fetchImages();
            setImages(result.images || []);
        } catch (err) {
            console.error('Refresh error:', err);
            setError('Could not refresh images. Please check your AWS connection.');
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Initial load
    // ---------------------------------------------------------------------------
    /**
     * To fetch data we always use the useEffect hook.
     * @async use a function within the hook that is async (faster)
     * @structure use a try catch block in case errors are thrown from API function
     * @array dependency array makes the hook re-run when `user` changes (MUST BE THERE)
     */
    useEffect(() => {
        const loadImages = async () => {
            if (IS_DEMO) {
                // Images already seeded in useState — nothing to fetch
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const result = await fetchImages();
                setImages(result.images || []);
            } catch (err) {
                console.error('Gallery Load Error:', err);
                setError('Issue with the API. Please check your AWS connection.');
            } finally {
                setLoading(false);
            }
        };

        loadImages();
    }, [user]);

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    if (error) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={handleRealRefresh}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h1>Gallery Page</h1>
                    <p className="text-muted">
                        {IS_DEMO
                            ? 'Demo mode — edits and deletes are local only'
                            : 'Explore your cloud-stored images!'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Refresh Images — fakes a sync in demo (keeps current state), real API call otherwise */}
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={IS_DEMO ? handleDemoRefresh : handleRealRefresh}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Syncing...
                            </>
                        ) : (
                            '🔄 Refresh Images'
                        )}
                    </button>

                    {/* Reset Demo — only visible in demo mode, wipes edits and restores original 3 images */}
                    {IS_DEMO && (
                        <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={handleDemoReset}
                            disabled={loading}
                        >
                            ↩ Reset Demo
                        </button>
                    )}
                </div>
            </header>

            <section className="content-area">
                {loading ? (
                    <ImageGrid loading={true} images={[]} />
                ) : images.length > 0 ? (
                    <ImageGrid
                        images={images}
                        loading={false}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="text-center mt-5">
                        <p>
                            {IS_DEMO
                                ? 'All demo images removed. Click "↩ Reset Demo" to restore them.'
                                : 'No images found. Head over to the Upload tab to add some!'}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default GalleryScreen;

// import React, { useState } from 'react';
// // import { Authenticator } from '@aws-amplify/ui-react';

// import ImageGrid from '../components/ImageGrid';
// import { fetchImages } from '../services/api';

// const GalleryScreen = ({user, signOut}) => {
//     //any states can go here; you can think of them like variables :)
//     const [loading, setLoading] = useState(true); //set loading to true for when the page first renders
//     const [error, setError] = useState(null);
//     const [images, setImages] = useState([])
// // import { getImages } from '../services/api';
// // import { resolveS3KeyToUrl } from '../utils/s3Resolver';

// const demoImages = [
//     {
//         id: '1',
//         title: 'Sunset Over Water',
//         s3Key: 'demo/sunset.jpg',
//         url: 'https://picsum.photos/400/300?random=1',
//         tags: ['sunset', 'water']
//     },
//     {
//         id: '2',
//         title: 'Mountain Trail',
//         s3Key: 'demo/mountain.jpg',
//         url: 'https://picsum.photos/400/300?random=2',
//         tags: ['mountain', 'nature']
//     },
//     {
//         id: '3',
//         title: 'Laptop Workspace',
//         s3Key: 'demo/laptop.jpg',
//         url: 'https://picsum.photos/400/300?random=3',
//         tags: ['laptop', 'workspace']
//     }
// ];

// const GalleryScreen = ({ user, signOut }) => {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [images, setImages] = useState(demoImages);

//     const handleDelete = (id) => {
//         setImages((prevImages) => prevImages.filter((img) => img.id !== id));
//     };

//     //(the following comment is in the style of java-doc commentation, usually prominent in prod code environments)
//     /**
//      * To fetch data we always use the useEffect hook.
//      * @async use a function within the hook that is async (faster)
//      * @structure use a try catch block in case errors are thrown from API function
//      * @array there should be a dependancy array at the end of the hoook that basically makes the hook run when changes in the dependancies occur (this is important)
//      * */
    
//     //Example hook 
//     useEffect(() =>{
//         //write/define the async helper function...but we still have to call it to run it
//         const loadImages = async () => {
//             // Check for Demo Mode first
//             if (import.meta.env.VITE_DEMO_MODE === 'true') {
//                 setLoading(false);
//                 setImages([]); // ImageGrid handles the mock data if this is empty and isDemo is true
//                 return;
//             }

//             try
//             {
//                 setLoading(true); //set loading to true so the UI will show "Rendering pictures"
//                 const result = await fetchImages();
//                 setImages(result.images || []); //place the data in a state so it can be used throughout the component (you'd have to declare this with the loading state variable)
//             } 
//             catch (err)
//             {
//                 console.error("Gallery Load Error:", err);
//                 setError("Issue with the API. Please check your AWS connection.");
//             }
//             finally //will run after try/catch
//             {
//                 setLoading(false);  //we want to make the UI not show loading text anymore (because it was set to true at page initialization)
//             }
//         };

//         loadImages();
//     }, [user]); //change every time the user is changed, if empty the useEffect will only run once (MUST BE THERE IN EVERY CASE)

//     //define what the UI will look like in all cases (loading, error, data was fetched)
    
//     // Improved error display
//     if (error && import.meta.env.VITE_DEMO_MODE !== 'true') {
//         return (
//             <div className="container mt-5 text-center">
//                 <div className="alert alert-danger">{error}</div>
//                 <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
//             </div>
//         );
//     }
//     if(loading) return (
//         <div className="text-center mt-5">
//             <h4>Syncing with AWS...</h4>
//             <ImageGrid loading={true} />
//         </div>);
//     if (error)  return <div className="alert alert-danger">{error}</div>;
//     const handleEdit = (id) => {
//         const newTitle = window.prompt("Enter a new title:");
//         if (!newTitle) return;

//         setImages((prevImages) =>
//             prevImages.map((img) =>
//                 img.id === id ? { ...img, title: newTitle } : img
//             )
//         );
//     };

//     if (loading) {
//         return (
//             <div className="text-center mt-5">
//                 <h4>Syncing with AWS...</h4>
//                 <ImageGrid loading={true} />
//             </div>
//         );
//     }

//     if (error) {
//         return <div className="alert alert-danger">{error}</div>;
//     }

//     return (
//         <div className="feature-container animate-fade-in">
//             <header className="mb-4 d-flex justify-content-between align-items-center">
//                 <div>
//                     <h1>Gallery Page</h1>
//                     <p className="text-muted">Explore your cloud-stored images</p>
//                 </div>
//                 {/* Adding a refresh button is always a good idea for Cloud Apps */}
//                 <button 
//                     className="btn btn-outline-secondary btn-sm" 
//                     onClick={() => window.location.reload()}
//                     disabled={loading}
//                 >
//                     {loading ? 'Syncing...' : 'Refresh Gallery'}
//                 </button>
//             </header>

//             <section className="content-area">
//                 {/* Passing both images and loading state ensures the 
//                   ImageGrid knows when to show skeletons vs data 
//                 */}
//                 <ImageGrid images={images} loading={loading}/>
                
//                 {!loading && images.length === 0 && import.meta.env.VITE_DEMO_MODE !== 'true' && (
//                     <div className="text-center mt-5">
//                         <p>No images found. Head over to the Upload tab to add some!</p>
//                     </div>
//                 {images.length > 0 ? (
//                     <ImageGrid
//                         images={images}
//                         loading={false}
//                         onDelete={handleDelete}
//                         onEdit={handleEdit}
//                     />
//                 ) : (
//                     <p>No images found. Upload some to see them here!</p>
//                 )}
//             </section>
//         </div>
//     );
// };

// export default GalleryScreen;
