import { Injectable } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';

@Injectable({ providedIn: 'root' })
export class MediaService extends BaseApiService {
  // upload media files
  async uploadMedia(context: 'Profile' | 'Event' | 'Post' | 'Other', files: File[]): Promise<any> {

    if (!files || files.length === 0) {
      throw new Error('At least one file is required for media upload.');
    }

    const formData = new FormData();
    formData.append('context', context);

    // append all files with the same field name 'files'
    files.forEach((file) => {
      formData.append('files', file);
    });

    return await this.post<any>('/media-upload', formData);
  }
}
