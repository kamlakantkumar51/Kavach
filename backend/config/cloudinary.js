import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    try {
        if (!filePath) return null;
        const uploadResult = await cloudinary.uploader.upload(filePath);
        
        // Clean up the local temp file after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return uploadResult.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        // Clean up local temp file if it still exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
}

export default uploadOnCloudinary;