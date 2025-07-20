import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (publicId, resource_type) => {
  try {
    if (!publicId || !resource_type) {
      console.error("❌ No publicId or resourc_type  provided for deletion.");
      return null;
    }

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type,
      invalidate: true, // Invalidate the cached version of the file
    });

    if (response.result === "ok" || response.result === "not found") {
      return response;
    } else {
      console.error("❌ Deletion failed or unexpected result:", response);
      return null;
    }
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
    return null;
  }
};



export {uploadOnCloudinary, deleteFromCloudinary}