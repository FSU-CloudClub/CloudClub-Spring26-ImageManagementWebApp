import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

const ImageUploader = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const uploadFile = async () => {
        if (!file) return;
        setUploading(true);
        
        // --- KEEPING DEMO MODE LOGIC ---
        if (import.meta.env.VITE_DEMO_MODE === 'true') {
            console.log("Running in Demo Mode...");
            const fakeUrl = URL.createObjectURL(file);
            const newEntry = {
                imageId: Date.now().toString(),
                s3Key: `demo/${file.name}`,
                downloadUrl: fakeUrl,
                Labels: ['Demo Upload', 'Preview Only']
            };
            const existing = JSON.parse(localStorage.getItem('demo_uploads') || '[]');
            localStorage.setItem('demo_uploads', JSON.stringify([newEntry, ...existing]));
            
            await new Promise(res => setTimeout(res, 1000));
            setUploading(false);
            if (onUploadSuccess) onUploadSuccess();
            return;
        }

        try {
            // 1. Get the current session
            const session = await fetchAuthSession();
            // Use ID Token for Cognito Authorizer
            const token = session.tokens?.idToken?.toString();
            
            if (!token) {
                throw new Error("Login session expired. Please sign in again.");
            }

            // 2. Format the API URL (Handling potential trailing slashes)
            const baseUrl = import.meta.env.VITE_API_URL.endsWith('/') 
                ? import.meta.env.VITE_API_URL 
                : `${import.meta.env.VITE_API_URL}/`;

            const url = `${baseUrl}upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`;

            // 3. Request the Presigned URL from your Backend
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': token, // RAW token to match template.yaml IdentitySource
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const { uploadUrl } = await response.json();

            // 4. Upload directly to S3
            // Note: We do NOT send the Authorization header to S3
            const s3Response = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!s3Response.ok) {
                throw new Error("S3 storage rejected the file.");
            }

            alert("Upload successful! Your image is being processed.");
            setFile(null); 
            if (onUploadSuccess) onUploadSuccess();

        } catch (err) {
            console.error("Upload process failed:", err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-section p-4 border-2 border-dashed rounded text-center mb-4">
            <div className="mb-3">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    disabled={uploading}
                    className="form-control"
                    accept="image/*"
                />
            </div>
            <button 
                onClick={uploadFile} 
                disabled={!file || uploading}
                className={`btn ${uploading ? 'btn-secondary' : 'btn-primary'} w-100 py-2`}
            >
                {uploading ? (
                    <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                    </span>
                ) : (
                    'Upload to Cloud Gallery'
                )}
            </button>
            {file && !uploading && (
                <p className="mt-2 text-muted small">Selected: {file.name}</p>
            )}
        </div>
    );
};

export default ImageUploader;