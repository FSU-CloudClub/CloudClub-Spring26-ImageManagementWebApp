const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export function validateFileSize(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File is too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` 
    };
  }

  return { valid: true, error: null };
}

export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }

  return { valid: true, error: null };
}
