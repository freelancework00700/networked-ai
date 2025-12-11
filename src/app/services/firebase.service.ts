import { getApp } from 'firebase/app';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  public readonly auth = this.getFirebaseAuth();
  public readonly storage = getStorage(getApp());

  private getFirebaseAuth() {
    if (Capacitor.isNativePlatform()) {
      // use IndexedDB persistence for native platforms
      return initializeAuth(getApp(), { persistence: indexedDBLocalPersistence });
    } else {
      // use default persistence for web platforms
      return getAuth(getApp());
    }
  }

  /**
   * Uploads an image file to Firebase Storage
   * @param file - The file to upload
   * @param isThumbnail - Whether this is a thumbnail image (default: false)
   * @param timestamp - Optional timestamp to use for the filename. If not provided, uses current timestamp
   * @returns Promise that resolves to the download URL
   */
  async uploadProfileImage(file: File, isThumbnail = false, timestamp?: number): Promise<string> {
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const extension = allowedExtensions.includes(fileExtension) ? fileExtension : 'png';

    // Create file name using provided timestamp or current timestamp: timestamp.png or timestamp_thumbnail.png
    const fileTimestamp = timestamp || Date.now();
    const fileName = isThumbnail ? `${fileTimestamp}_thumbnail.${extension}` : `${fileTimestamp}.${extension}`;
    const storageRef = ref(this.storage, `networked-ai/profile-images/${fileName}`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  /**
   * Creates a thumbnail image (max 5KB) from a File or image URL
   * @param source - File object or image URL string
   * @returns Promise that resolves to a File object of the thumbnail
   */
  async createThumbnail(source: File | string): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let objectUrl: string | null = null;

      img.onload = () => {
        try {
          // Calculate dimensions to maintain aspect ratio while keeping file size small
          const maxDimension = 200; // Max width or height
          let width = img.width;
          let height = img.height;

          // Resize if needed
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Clean up object URL if created
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }

          // Convert to blob with compression and ensure max 5KB
          this.compressImageToMaxSize(canvas, 5 * 1024)
            .then((compressedBlob) => {
              const file = new File([compressedBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
              resolve(file);
            })
            .catch((error) => {
              reject(error);
            });
        } catch (error) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      // Load image from File or URL
      if (source instanceof File) {
        objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
      } else {
        img.src = source;
      }
    });
  }

  /**
   * Compresses an image to a maximum file size
   * @param canvas - The canvas element with the image
   * @param maxSizeBytes - Maximum size in bytes (default: 5KB)
   * @returns Promise that resolves to a Blob
   */
  private async compressImageToMaxSize(canvas: HTMLCanvasElement, maxSizeBytes: number): Promise<Blob> {
    return new Promise((resolve) => {
      let quality = 0.8;
      const step = 0.1;

      const tryCompress = (): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size <= maxSizeBytes || quality <= 0.1) {
              resolve(blob || new Blob());
            } else {
              quality -= step;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    });
  }
}
