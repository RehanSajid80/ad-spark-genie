
/**
 * Converts a File to a base64 string, with size limit handling
 */
export const fileToBase64 = async (file: File): Promise<string | null> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Check if the result is excessively large (>10MB)
        if (result && result.length > 10 * 1024 * 1024) {
          console.warn('Image is too large for base64 encoding (>10MB). Using URL only.');
          resolve(null); // Return null to indicate we should skip base64 encoding
        } else {
          resolve(result);
        }
      };
      reader.onerror = error => {
        console.error('Error reading file for base64 conversion:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Exception during base64 conversion:', error);
    return null; // Return null on error to allow fallback
  }
};
