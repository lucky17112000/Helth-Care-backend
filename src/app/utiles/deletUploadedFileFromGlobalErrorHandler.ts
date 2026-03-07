import { Request } from "express";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

export const deleteUploadedFileFromGlobalErrorHandler = async (
  req: Request,
) => {
  try {
    const filesToDelete: string[] = [];
    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    } else if (
      req.files &&
      typeof req.files === "object" &&
      !Array.isArray(req.files)
    ) {
      //req.files=> [[{...}],[{...}]]...
      //whenever we use multerUpload.fields in that case it will be object for that reson we cheak it is it object or not and we use it for multiple file uplaod
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file?.path) {
              filesToDelete.push(file.path);
            }
          });
        } else if (
          req.files &&
          Array.isArray(req.files) &&
          req.files.length > 0
        ) {
          req.files.forEach((file) => {
            if (file?.path) {
              filesToDelete.push(file.path);
            }
          });
        }
      });
    }
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((url) => deleteFileFromCloudinary(url)),
      );
      console.log("Uploaded file(s) deleted from Cloudinary successfully.");
    }
  } catch (error: any) {
    console.error("Error deleting uploaded file:", error);
  }
};
//!SECTION this function will delete all type of upload file whatevr type it is opbject or array of object and single file upload
