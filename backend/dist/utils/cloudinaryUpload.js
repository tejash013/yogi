import cloudinary from '../config/cloudinary.js';
/**
 * Upload an image to Cloudinary
 * @param fileUri - URL or file path to upload
 * @param publicId - Public ID for the image in Cloudinary
 * @param folder - Folder path in Cloudinary (e.g., 'menu-items', 'offers')
 * @returns Upload result with secure URL
 */
export async function uploadImage(fileUri, publicId, folder) {
    try {
        const uploadOptions = {};
        if (publicId)
            uploadOptions.public_id = publicId;
        if (folder)
            uploadOptions.folder = folder;
        const result = await cloudinary.uploader.upload(fileUri, uploadOptions);
        return result;
    }
    catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}
/**
 * Get optimized image URL
 * @param publicId - Public ID of the image in Cloudinary
 * @param options - Cloudinary transformation options
 * @returns Optimized image URL
 */
export function getOptimizedUrl(publicId, options) {
    const defaultOptions = {
        fetch_format: 'auto',
        quality: 'auto',
    };
    return cloudinary.url(publicId, {
        ...defaultOptions,
        ...options,
    });
}
/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}
