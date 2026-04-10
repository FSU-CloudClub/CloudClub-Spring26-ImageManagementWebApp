import React, { useState, useRef, useEffect } from 'react';
import { uploadImage, getImageStatus } from '../services/api';
import { validateFile } from '../services/validators';
import { useNotification } from '../components/NotificationContext';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * renderLabels — shared label rendering used in the result card.
 * By this point labels are already normalized tuples [name, confidence]
 * by normalizeImage() in api.js, so we just display them.
 */
const renderLabels = (Labels) => {
    if (!Array.isArray(Labels) || Labels.length === 0) return null;
    return Labels.map((label, idx) => {
        const name       = Array.isArray(label) ? label[0] : label;
        const confidence = Array.isArray(label) && label[1] != null
            ? Math.round(label[1] * 100)
            : null;
        return (
            <span key={idx} className="tag-pill">
                {name}
                {confidence !== null && (
                    <span style={{ opacity: 0.65, fontSize: '0.75em', marginLeft: 3 }}>
                        ({confidence}%)
                    </span>
                )}
                {idx < Labels.length - 1 && (
                    <span style={{ marginLeft: 1, opacity: 0.4 }}>,</span>
                )}
            </span>
        );
    });
};

const UploadScreen = ({ user }) => {
    const { showNotification } = useNotification();
    const [selectedFile, setSelectedFile]   = useState(null);
    const [preview, setPreview]             = useState(null);
    const [uploading, setUploading]         = useState(false);
    const [processing, setProcessing]       = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [error, setError]                 = useState(null); // validation errors only — shown inline
    const fileInputRef  = useRef(null);
    const intervalRef   = useRef(null); // track poll interval so we can clear on unmount

    // Clear the poll interval if the component unmounts mid-upload
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // -------------------------------------------------------------------------
    // File selection — validates immediately, shows preview if valid
    // -------------------------------------------------------------------------
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const { valid, error: validationError } = validateFile(file);
        if (!valid) {
            setError(validationError);
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setError(null);
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setUploadedImage(null);
    };

    // -------------------------------------------------------------------------
    // pollImageStatus — polls every 3s until Rekognition finishes (COMPLETE).
    // Stores interval ref so it can be cleared on unmount.
    // -------------------------------------------------------------------------
    const pollImageStatus = (imageId) => {
        intervalRef.current = setInterval(async () => {
            try {
                const data = await getImageStatus(imageId);
                if (data?.status === 'COMPLETE') {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setProcessing(false);
                    setUploadedImage(data);
                }
            } catch (err) {
                console.error('Polling error:', err);
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setProcessing(false);
                showNotification('Could not retrieve image status. Check the Gallery.', 'warning');
            }
        }, 3000);
    };

    // -------------------------------------------------------------------------
    // handleUpload
    // -------------------------------------------------------------------------
    const handleUpload = async () => {
        if (!selectedFile) return;
        setError(null);
        setUploading(true);

        try {
            const result = await uploadImage(selectedFile);
            setUploadedImage(result);
            setUploading(false);
            setProcessing(true);
            showNotification('Upload successful! Rekognition is analysing your image...', 'info');
            pollImageStatus(result.imageId);
        } catch (err) {
            console.error('Upload failed:', err);
            setUploading(false);
            showNotification('Upload failed. Please try again.', 'danger');
        }
    };

    // -------------------------------------------------------------------------
    // Reset
    // -------------------------------------------------------------------------
    const handleReset = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setSelectedFile(null);
        setPreview(null);
        setUploadedImage(null);
        setProcessing(false);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4">
                <h1>Upload Image</h1>
                <p className="text-muted">
                    {IS_DEMO
                        ? 'Demo mode — uploads are simulated locally'
                        : 'Upload an image and AWS Rekognition will tag it automatically'}
                </p>
            </header>

            <section className="content-area">
                {!uploadedImage && (
                    <div className="mb-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg, image/png, image/gif"
                            className="form-control mb-2"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <p className="text-muted small mb-3">
                            Accepted: JPEG, PNG, GIF — max 5MB
                        </p>

                        {preview && (
                            <div className="mb-3">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: 300,
                                        borderRadius: 10,
                                        objectFit: 'cover',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger py-2">{error}</div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-cloud-upload me-2" />
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                )}

                {uploadedImage && (
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: '1.5rem',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            maxWidth: 420,
                        }}
                    >
                        <img
                            src={uploadedImage.downloadUrl}
                            alt={uploadedImage.s3Key}
                            style={{
                                width: '100%',
                                borderRadius: 8,
                                marginBottom: '1rem',
                                objectFit: 'cover',
                                maxHeight: 240,
                            }}
                        />

                        <p className="fw-semibold mb-1">
                            {uploadedImage.s3Key?.split('/').pop()}
                        </p>

                        <div className="mb-2">
                            {processing ? (
                                <span className="badge bg-warning text-dark">
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                                    Rekognition analysing...
                                </span>
                            ) : (
                                <span className="badge bg-success">✓ Complete</span>
                            )}
                        </div>

                        {!processing && uploadedImage.Labels?.length > 0 && (
                            <div className="mb-3">
                                <p className="text-muted small mb-1">Detected tags:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {renderLabels(uploadedImage.Labels)}
                                </div>
                            </div>
                        )}

                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleReset}
                        >
                            Upload another
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default UploadScreen;