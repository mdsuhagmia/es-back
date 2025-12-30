const cloudinary = require("../config/cloudinary");

const publicIdWithoutExtensionFromUrl = async (imageUrl)=>{
    const pathSegments = imageUrl.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1]
    const valueWithoutExtention = lastSegment.replace(".jpg", "");
    return valueWithoutExtention;
}

const deleteFileFromCloudinary = async (folderName, publicId, modelName)=>{
    try {
        const {result} = await cloudinary.uploader.destroy(`${folderName}/${publicId}`)
      if(result !== 'ok'){
        throw new Error(`${modelName} image was delete not successfully from cloudinary. Please try again.`)
      }
    } catch (error) {
        throw error;
    }
}

module.exports = {publicIdWithoutExtensionFromUrl, deleteFileFromCloudinary};