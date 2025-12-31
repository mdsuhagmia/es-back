const cloudinary = require("../config/cloudinary");

const publicIdWithoutExtensionFromUrl = async (imageUrl) => {
    if (typeof imageUrl !== 'string') {
        throw new Error("imageUrl must be a string. Received: " + typeof imageUrl);
    }

    const pathSegments = imageUrl.split("/");
    
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    const valueWithoutExtension = lastSegment.split(".")[0];
    
    return valueWithoutExtension; 
};

const deleteFileFromCloudinary = async (folderName, publicId, modelName) => {
    try {
        const path = folderName ? `${folderName}/${publicId}` : publicId;

        const { result } = await cloudinary.uploader.destroy(path);

        if (result === 'not found') {
            console.warn(`Warning: Image not found on Cloudinary for path: ${path}`);
            return;
        }

        if (result !== 'ok') {
            throw new Error(`Cloudinary delete failed: ${result}`);
        }
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw error;
    }
}

module.exports = {publicIdWithoutExtensionFromUrl, deleteFileFromCloudinary};