import React, { useState, useEffect } from 'react';
import ImageGrid from '../components/ImageGrid';
import { fetchImages } from '../services/api';

const GalleryScreen = ({ user, signOut }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);

    const handleDelete = (id) => {
        setImages((prevImages) => prevImages.filter((img) => img.imageId !== id));
    };

    const handleEdit = (id) => {
        const newTitle = window.prompt("Enter a new title:");
        if (!newTitle) return;

        setImages((prevImages) =>
            prevImages.map((img) =>
                img.imageId === id ? { ...img, title: newTitle } : img
            )
        );
    };

    /**
     * To fetch data we always use the useEffect hook.
     * @async use a function within the hook that is async (faster)
     * @structure use a try catch block in case errors are thrown from API function
     * @array there should be a dependency array at the end of the hook that makes the hook run when changes in the dependencies occur
     */
    useEffect(() => {
        const loadImages = async () => {
            if (import.meta.env.VITE_DEMO_MODE === 'true') {
                setLoading(false);
                setImages([]);
                return;
            }

            try {
                setLoading(true);
                const result = await fetchImages();
                setImages(result.images || []);
            } catch (err) {
                console.error("Gallery Load Error:", err);
                setError("Issue with the API. Please check your AWS connection.");
            } finally {
                setLoading(false);
            }
        };

        loadImages();
    }, [user]);

    if (error && import.meta.env.VITE_DEMO_MODE !== 'true') {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center mt-5">
                <h4>Syncing with AWS...</h4>
                <ImageGrid loading={true} />
            </div>
        );
    }

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h1>Gallery Page</h1>
                    <p className="text-muted">Explore your cloud-stored images</p>
                </div>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => window.location.reload()}
                    disabled={loading}
                >
                    {loading ? 'Syncing...' : 'Refresh Gallery'}
                </button>
            </header>

            <section className="content-area">
                {images.length > 0 ? (
                    <ImageGrid
                        images={images}
                        loading={false}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ) : (
                    import.meta.env.VITE_DEMO_MODE !== 'true' && (
                        <div className="text-center mt-5">
                            <p>No images found. Head over to the Upload tab to add some!</p>
                        </div>
                    )
                )}
            </section>
        </div>
    );
};

export default GalleryScreen;