import React, { useState, useEffect } from 'react';
import ImageGrid from '../components/ImageGrid';
import { fetchImages, deleteImage } from '../services/api';
import { useNotification } from '../components/NotificationContext';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

// Demo images — single source of truth for the whole gallery in demo mode.
// Shape matches exactly what ImageGrid and api.js expect.
const demoImages = [
    {
        imageId: 'd1',
        downloadUrl: 'https://picsum.photos/id/15/400/300',
        s3Key: 'demo/sunset-over-water.jpg',
        Labels: [['Sunset', 99], ['Water', 97], ['Sky', 95], ['Horizon', 89], ['Orange', 84]],
    },
    {
        imageId: 'd2',
        downloadUrl: 'https://picsum.photos/id/29/400/300',
        s3Key: 'demo/mountain-trail.jpg',
        Labels: [['Mountain', 98], ['Nature', 96], ['Trail', 91], ['Trees', 88]],
    },
    {
        imageId: 'd3',
        downloadUrl: 'https://picsum.photos/id/20/400/300',
        s3Key: 'demo/laptop-workspace.jpg',
        Labels: [['Laptop', 99], ['Workspace', 93], ['Desk', 87]],
    },
    {
        imageId: 'd4',
        downloadUrl: 'https://picsum.photos/id/1015/400/300',
        s3Key: 'demo/forest-river.jpg',
        Labels: [['Forest', 98], ['River', 95], ['Nature', 93], ['Rocks', 88], ['Water', 85]],
    },
    {
        imageId: 'd5',
        downloadUrl: 'https://picsum.photos/id/539/400/300',
        s3Key: 'demo/train.jpg',
        Labels: [['Train', 99], ['Cold', 96]],
    },
    {
        imageId: 'd6',
        downloadUrl: 'https://picsum.photos/id/1018/400/300',
        s3Key: 'demo/misty-mountains.jpg',
        Labels: [['Mountains', 97], ['Fog', 94], ['Trees', 91], ['Landscape', 88]],
    },
    {
        imageId: 'd7',
        downloadUrl: 'https://picsum.photos/id/1040/400/300',
        s3Key: 'demo/big-castle.jpg',
        Labels: [['Woods', 98], ['Castle', 95], ['Architecture', 91], ['Building', 87]],
    },
    {
        imageId: 'd8',
        downloadUrl: 'https://picsum.photos/id/152/400/300',
        s3Key: 'demo/flower-field.jpg',
        Labels: [['Flowers', 99], ['Field', 95], ['Nature', 92], ['Color', 88], ['Spring', 83]],
    },
    {
        imageId: 'd9',
        downloadUrl: 'https://picsum.photos/id/1060/400/300',
        s3Key: 'demo/coffee-shop.jpg',
        Labels: [['Coffee', 98], ['Cabin', 94], ['Winter', 91], ['Tea', 87], ['Cafe', 82]],
    },
    {
        imageId: 'd10',
        downloadUrl: 'https://picsum.photos/id/247/400/300',
        s3Key: 'demo/desert-dunes.jpg',
        Labels: [['Desert', 99], ['Sand', 96], ['Dunes', 93], ['Sky', 88], ['Arid', 81]],
    },
];


const GalleryScreen = ({ user, signOut }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState(IS_DEMO ? demoImages : []);

    // -------------------------------------------------------------------------
    // Delete
    // Demo: local state only, wiped by Reset Demo.
    // Real: calls deleteImage() from api.js, then removes from local state.
    // -------------------------------------------------------------------------
    const handleDelete = async (imageId) => {
        if (IS_DEMO) {
            setImages((prev) => prev.filter((img) => img.imageId !== imageId));
            return;
        }
        try {
            await deleteImage(imageId);
            setImages((prev) => prev.filter((img) => img.imageId !== imageId));
            showNotification('Image deleted successfully.', 'success');
        } catch (err) {
            console.error('Delete failed:', err);
            showNotification('Could not delete image. Please try again.', 'danger');
        }
    };

    const handleEdit = async (imageId) => {
        const newTags = window.prompt('Enter new tags (comma separated):');
        if (!newTags) return;

        const formattedTags = newTags.split(',').map(tag => [tag.trim(), 0]);

        if (IS_DEMO) {
            setImages((prev) =>
                prev.map((img) =>
                    img.imageId === imageId ? { ...img, Labels: formattedTags } : img
                )
            );
            return;
        }

        try {
            await updateImageTags(imageId, formattedTags);
            setImages((prev) =>
                prev.map((img) =>
                    img.imageId === imageId ? { ...img, Labels: formattedTags } : img
                )
            );
            showNotification('Tags updated successfully.', 'success');
        } catch (err) {
            console.error('Edit failed:', err);
            showNotification('Could not update tags. Please try again.', 'danger');
        }
    };


    // -------------------------------------------------------------------------
    // Refresh Images (demo) — skeleton briefly, then restores current state.
    // Does NOT wipe edits or deletes — that's Reset Demo's job.
    // -------------------------------------------------------------------------
    const handleDemoRefresh = () => {
        const snapshot = images; // capture current state before skeleton
        setLoading(true);
        setTimeout(() => {
            setImages(snapshot);
            setLoading(false);
        }, 1200);
    };

    // -------------------------------------------------------------------------
    // Reset Demo — skeleton briefly, then restores original demoImages.
    // -------------------------------------------------------------------------
    const handleDemoReset = () => {
        setLoading(true);
        setTimeout(() => {
            setImages(demoImages);
            setLoading(false);
        }, 1200);
    };

    // -------------------------------------------------------------------------
    // Refresh Images (real) — re-fetches from the API via fetchImages().
    // -------------------------------------------------------------------------
    const handleRealRefresh = async () => {
        setLoading(true);
        try {
            const result = await fetchImages();
            setImages(result.images || []);
        } catch (err) {
            console.error('Refresh error:', err);
            showNotification('Could not refresh images. Please check your AWS connection.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // Initial load
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadImages = async () => {
            if (IS_DEMO) {
                setLoading(false); // already seeded in useState
                return;
            }
            try {
                setLoading(true);
                const result = await fetchImages();
                setImages(result.images || []);
            } catch (err) {
                console.error('Gallery Load Error:', err);
                showNotification('Issue with the API. Please check your AWS connection.', 'danger');
            } finally {
                setLoading(false);
            }
        };
        loadImages();
    }, [user]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h1>Gallery</h1>
                    <p className="text-muted">
                        {IS_DEMO
                            ? 'Demo mode — edits and deletes are local only'
                            : 'Explore your cloud-stored images'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
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