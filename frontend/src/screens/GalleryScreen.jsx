import React, { useState } from 'react';
// import { Authenticator } from '@aws-amplify/ui-react';

import ImageGrid from '../components/ImageGrid';
// import { getImages } from '../services/api';
// import { resolveS3KeyToUrl } from '../utils/s3Resolver';

const demoImages = [
    {
        id: '1',
        title: 'Sunset Over Water',
        s3Key: 'demo/sunset.jpg',
        url: 'https://picsum.photos/400/300?random=1',
        tags: ['sunset', 'water']
    },
    {
        id: '2',
        title: 'Mountain Trail',
        s3Key: 'demo/mountain.jpg',
        url: 'https://picsum.photos/400/300?random=2',
        tags: ['mountain', 'nature']
    },
    {
        id: '3',
        title: 'Laptop Workspace',
        s3Key: 'demo/laptop.jpg',
        url: 'https://picsum.photos/400/300?random=3',
        tags: ['laptop', 'workspace']
    }
];

const GalleryScreen = ({ user, signOut }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState(demoImages);

    const handleDelete = (id) => {
        setImages((prevImages) => prevImages.filter((img) => img.id !== id));
    };

    const handleEdit = (id) => {
        const newTitle = window.prompt("Enter a new title:");
        if (!newTitle) return;

        setImages((prevImages) =>
            prevImages.map((img) =>
                img.id === id ? { ...img, title: newTitle } : img
            )
        );
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <h4>Syncing with AWS...</h4>
                <ImageGrid loading={true} />
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4">
                <h1>Gallery Page</h1>
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
                    <p>No images found. Upload some to see them here!</p>
                )}
            </section>
        </div>
    );
};

export default GalleryScreen;
