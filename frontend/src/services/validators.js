const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFileSize(file) {
    if (!file) return { valid: false, error: 'No file provided' };
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large. Max 5MB — yours is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
    }
    return { valid: true, error: null };
}

export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
    if (!file) return { valid: false, error: 'No file provided' };
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        };
    }
    return { valid: true, error: null };
}

/**
 * validateFile — runs both checks in one call.
 * Use this in UploadScreen instead of calling them separately.
 * @param {File} file
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateFile(file) {
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) return sizeCheck;
    return validateFileType(file);
}