import { MOCK_API_ENABLED } from '@/mocks/mockConfig';

/**
 * Cloudinary Upload Utility
 * Handles image uploads to Cloudinary. In frontend mock mode it returns a
 * local data URL so profile/media UI can be tested without Cloudinary keys.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Không thể đọc file ảnh'));
    reader.readAsDataURL(file);
});

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export const uploadToCloudinary = async (file, options = {}) => {
    if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
    }

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        throw new Error('File must be an image');
    }

    if (MOCK_API_ENABLED) {
        return fileToDataUrl(file);
    }

    if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary Cloud Name not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env file');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || 'ml_default');

    if (options.folder) {
        formData.append('folder', options.folder);
    }

    if (options.width || options.height) {
        const transformation = [];
        if (options.width) transformation.push(`w_${options.width}`);
        if (options.height) transformation.push(`h_${options.height}`);
        if (options.crop) transformation.push(`c_${options.crop}`);
        else transformation.push('c_limit');

        formData.append('transformation', transformation.join(','));
    }

    if (options.publicId) {
        formData.append('public_id', options.publicId);
    }

    try {
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.secure_url || data.url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Upload avatar image to Cloudinary
 * Optimized for avatar uploads (square, max 500x500)
 * @param {File} file - Avatar image file
 * @returns {Promise<string>} - Public URL of uploaded avatar
 */
export const uploadAvatar = async (file) => uploadToCloudinary(file, {
    folder: 'avatars',
    width: 500,
    height: 500,
    crop: 'fill',
    gravity: 'face'
});

export default {
    uploadToCloudinary,
    uploadAvatar
};
