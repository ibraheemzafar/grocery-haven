import { bucket } from "../lib/firebase";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToFirebase(file: Express.Multer.File): Promise<string> {
  const fileName = `products/${uuidv4()}-${file.originalname}`;
  const blob = bucket.file(fileName);

  const stream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);

    stream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
}