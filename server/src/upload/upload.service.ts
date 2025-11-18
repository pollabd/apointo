import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private cloudinaryConfigured: boolean;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.cloudinaryConfigured = true;
      console.log('✅ Cloudinary configured');
    } else {
      this.cloudinaryConfigured = false;
      console.log('⚠️  Cloudinary not configured, using local storage fallback');
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }

    // Try Cloudinary first
    if (this.cloudinaryConfigured) {
      try {
        const result = await this.uploadToCloudinary(file);
        return result;
      } catch (error) {
        console.error('Cloudinary upload failed, falling back to local storage:', error.message);
      }
    }

    // Fallback to local storage
    return this.uploadToLocal(file);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'apointo',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        },
      ).end(file.buffer);
    });
  }

  private uploadToLocal(file: Express.Multer.File): string {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, file.buffer);
    
    return `/uploads/${filename}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (imageUrl.startsWith('http')) {
      // Cloudinary image
      if (this.cloudinaryConfigured) {
        const publicId = this.extractPublicId(imageUrl);
        await cloudinary.uploader.destroy(publicId);
      }
    } else {
      // Local image
      const filepath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }

  private extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
