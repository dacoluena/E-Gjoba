
import cloudinary from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});
 async function uploadtoCLoudinary(newFiles){
const multiphoto=newFiles.map(file => (
    cloudinary.v2.uploader.upload(file.filepath, {folder :'e-gjoba'})
))

return await Promise.all(multiphoto)
 }


export async function uploadphoto(formData){
    try{
        const photos = await uploadtoCLoudinary(formData);
        console.log(photos);
        
    }catch(error){
        return {errMsg: error.message}
    }
}

