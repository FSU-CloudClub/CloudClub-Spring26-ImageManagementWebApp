import { fetchAuthSession } from 'aws-amplify/auth';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
const API_URL = import.meta.env.VITE_API_URL;

// ─── Mock Store ───────────────────────────────────────────────────────────────
// Only used in demo mode. Lives in memory — wiped on page refresh.
// Shape uses [name, confidence] tuples to match what normalizeLabels expects.

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

// mockImages starts as a copy of demoImages so fetchImages() returns them in demo mode.
// Uploads in demo mode push into this array on top of the defaults.
let mockImages = [...demoImages];

// ─── Auth Helper ──────────────────────────────────────────────────────────────

/**
 * getAuthToken — retrieves the Cognito ID token for authenticated API calls.
 * @returns {Promise<string>}
 */
async function getAuthToken() {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
}

// ─── Shape Normalizer ─────────────────────────────────────────────────────────

/**
 * normalizeImage — converts whatever shape the real API returns into the
 * consistent internal shape all components expect:
 *   { imageId, downloadUrl, s3Key, Labels: [[name, confidence], ...], status }
 *
 * Real Rekognition Lambda typically returns something like:
 *   { imageId, downloadUrl, s3Key, Labels: [{ Name: "Dog", Confidence: 99.1 }], status }
 *
 * We normalize Labels to [name, 0–1 confidence] tuples here so nothing
 * downstream ever has to worry about the raw API shape.
 */
function normalizeImage(raw) {
    const labels = Array.isArray(raw.Labels)
        ? raw.Labels.map((l) => {
              // Already a tuple [name, confidence] — pass through
              if (Array.isArray(l)) return [String(l[0]), Number(l[1])];
              // Rekognition object { Name, Confidence } — Confidence is 0–100
              if (l && typeof l === 'object' && l.Name != null) {
                  return [String(l.Name), Number(l.Confidence) / 100];
              }
              // Plain string — no confidence available
              if (typeof l === 'string') return [l, null];
              return null;
          }).filter(Boolean)
        : [];

    return {
        imageId:     raw.imageId     ?? raw.id ?? raw.ImageId,
        downloadUrl: raw.downloadUrl ?? raw.url ?? raw.DownloadUrl,
        s3Key:       raw.s3Key       ?? raw.key ?? raw.S3Key,
        Labels:      labels,
        status:      raw.status      ?? raw.Status ?? 'COMPLETE',
    };
}

// ─── fetchImages ─────────────────────────────────────────────────────────────

/**
 * fetchImages — retrieves all images for the current user.
 * Demo: returns mockImages (seeded with demoImages + any uploads this session).
 * Real: backend dev's implementation — GET /images with Cognito ID token.
 *       Handles both bare array and { images: [] } response shapes.
 *       Each image is normalized so all components get consistent field names.
 * @returns {Promise<{ images: object[] }>}
 */
export async function fetchImages() {
    if (IS_DEMO) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ images: mockImages }), 500);
        });
    }

    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        const response = await fetch(`${API_URL}/images`, {
            method: 'GET',
            headers: {
                'Authorization': token, // No "Bearer" prefix — Cognito authorizer expects raw token
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Gallery request failed: ${response.status}`);

        const payload = await response.json();
        // Backend may return a bare array or { images: [] }
        const raw = Array.isArray(payload) ? payload : (payload?.images ?? []);
        return { images: raw.map(normalizeImage) };
    } catch (err) {
        console.error('fetchImages error:', err);
        throw err;
    }
}

// ─── uploadImage ─────────────────────────────────────────────────────────────

/**
 * uploadImage — uploads an image and triggers Rekognition tagging.
 * Demo: fakes a two-phase upload (PROCESSING → COMPLETE after 5s).
 * Real: POST to get a presigned S3 URL → PUT file → return PROCESSING image.
 *       downloadUrl comes from the API (a real S3 URL), not a local blob,
 *       so it persists across refreshes.
 * @param {File} imageFile
 * @returns {Promise<object>} normalized image in PROCESSING state
 */
export async function uploadImage(imageFile) {
    if (IS_DEMO) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newImage = {
                    imageId: `mock-${Date.now()}`,
                    downloadUrl: URL.createObjectURL(imageFile), // local preview, demo only
                    s3Key: `uploads/${imageFile.name}`,
                    Labels: [],
                    status: 'PROCESSING',
                };
                mockImages.push(newImage);

                // Simulate Rekognition finishing after 5 seconds
                setTimeout(() => {
                    const image = mockImages.find((img) => img.imageId === newImage.imageId);
                    if (image) {
                        image.status = 'COMPLETE';
                        image.Labels = [['Dog', 0.99], ['Animal', 0.97], ['Pet', 0.94]];
                    }
                }, 5000);

                resolve(newImage);
            }, 1500);
        });
    }

    try {
        const token = await getAuthToken();

        // Step 1: get a presigned S3 URL + the imageId the backend assigned
        const presignRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: imageFile.name,
                fileType: imageFile.type,
            }),
        });
        if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.status}`);
        const { uploadUrl, imageId, s3Key, downloadUrl } = await presignRes.json();

        // Step 2: PUT the file directly to S3
        const s3Res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': imageFile.type },
            body: imageFile,
        });
        if (!s3Res.ok) throw new Error(`S3 upload failed: ${s3Res.status}`);

        // Return normalized PROCESSING image.
        // downloadUrl from the API is a real S3 URL — use that, not a local blob.
        return normalizeImage({
            imageId,
            downloadUrl: downloadUrl ?? URL.createObjectURL(imageFile),
            s3Key,
            Labels: [],
            status: 'PROCESSING',
        });
    } catch (err) {
        console.error('uploadImage error:', err);
        throw err;
    }
}

// ─── deleteImage ─────────────────────────────────────────────────────────────

/**
 * deleteImage — deletes an image by ID.
 * Demo: filters it out of mockImages.
 * Real: DELETE /images/:imageId — reads response to confirm success.
 * @param {string} imageId
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteImage(imageId) {
    if (IS_DEMO) {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockImages = mockImages.filter((img) => img.imageId !== imageId);
                resolve({ success: true });
            }, 500);
        });
    }

    try {
        const token = await getAuthToken();

        const response = await fetch(`${API_URL}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`deleteImage failed: ${response.status}`);
        // Read response if available, otherwise assume success
        const data = await response.json().catch(() => ({}));
        return { success: data.success ?? true };
    } catch (err) {
        console.error('deleteImage error:', err);
        throw err;
    }
}

    export async function updateImageTags(imageId, tags) {

        try {
            const token = await getAuthToken();
            const session = await fetchAuthSession();
            const userId = session.tokens?.idToken?.payload?.sub;

            const response = await fetch(`${API_URL}/update-metadata`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, imageId, tags }),
            });
            if (!response.ok) throw new Error(`updateImageTags failed: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error('updateImageTags error:', err);
            throw err;
        }
    }