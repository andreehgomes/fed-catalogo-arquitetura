import { Injectable, inject } from "@angular/core";
import {
  Storage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadResult,
  UploadTask,
} from "@angular/fire/storage";
import { Observable, from } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FirebaseStorageService {
  private storage: Storage = inject(Storage);

  /**
   * Upload file to storage
   */
  async uploadFile(
    path: string,
    file: File | Blob
  ): Promise<UploadResult> {
    try {
      const storageRef = ref(this.storage, path);
      return await uploadBytes(storageRef, file);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Upload file with progress tracking
   */
  uploadFileResumable(path: string, file: File | Blob): UploadTask {
    const storageRef = ref(this.storage, path);
    return uploadBytesResumable(storageRef, file);
  }

  /**
   * Get download URL for a file
   */
  getDownloadURL(path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    return from(getDownloadURL(storageRef));
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  /**
   * List all files in a path
   */
  async listFiles(path: string): Promise<StorageReference[]> {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      return result.items;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  /**
   * Get storage reference
   */
  getStorageRef(path: string): StorageReference {
    return ref(this.storage, path);
  }
}
