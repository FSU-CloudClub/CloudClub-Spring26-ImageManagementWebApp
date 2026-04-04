import { getUrl } from 'aws-amplify/storage';

/**
 * Logic to convert S3 Keys (stored in the DB) into viewable pre-signed URLs.
 * 
 * @param {string} key - The S3 object key or path
 * @returns {Promise<string|null>} - The pre-signed URL to securely view the image
 */
export const resolveS3KeyToUrl = async (key) => {
    if (!key) return null;

    try {
        // In AWS Amplify v6, getUrl replaces Storage.get.
        const requestParams = {
            options: {
                validateObjectExistence: false, // Set to false to avoid extra pre-flight requests if unnecessary
                expiresIn: 3600 // URL valid for 1 hour
            }
        };

        // If the DB stored the exact absolute S3 path, pass it directly.
        if (key.startsWith('private/') || key.startsWith('public/') || key.startsWith('protected/')) {
            requestParams.path = key;
        } else {
            // If the DB only stored the raw filename, automatically format it
            // as a 'private' image for the currently authenticated user based on the acceptance criteria.
            requestParams.path = ({ identityId }) => `private/${identityId}/${key}`;
        }

        const result = await getUrl(requestParams);
        
        // result.url is a URL object in Amplify v6, converting to string for standard img src use
        return result.url.toString();

    } catch (error) {
        console.error("Error resolving S3 URL for key:", key, error);
        return null; // Return null on failure so the UI can gracefully fallback (e.g. to a broken image icon)
    }
};
