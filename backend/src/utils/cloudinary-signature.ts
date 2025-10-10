import { v2 as cloudinary } from "cloudinary";

export function getCloudinarySignature(params: Record<string, any>) {
  return cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
}
