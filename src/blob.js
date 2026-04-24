import { put } from '@vercel/blob';

const BLOB_TOKEN = "vercel_blob_rw_CLIXFWX2KjeaQ3q5_eMc8WOTVM6iVD45Id7ZPCoIQQqDuS9";

export async function uploadImage(file) {
  try {
    const blob = await put(file.name, file, {
      access: 'public',
      token: BLOB_TOKEN
    });
    return blob.url;
  } catch (error) {
    console.error("Blob upload error:", error);
    throw error;
  }
}