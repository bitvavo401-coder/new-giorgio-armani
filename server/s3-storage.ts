import AWS from "aws-sdk";

/**
 * S3/R2 Storage Manager untuk Cloudflare R2 atau AWS S3
 * Support untuk file uploads terpisah dari database
 */

export class S3StorageManager {
  private s3: AWS.S3;
  private bucketName: string;
  private region: string;
  private endpoint: string | undefined;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || "default-bucket";
    this.region = process.env.AWS_REGION || "us-east-1";
    this.endpoint = process.env.AWS_S3_ENDPOINT; // For R2: https://xxx.r2.cloudflarestorage.com

    // Configure AWS SDK
    const config: AWS.S3.ClientConfiguration = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: this.region,
    };

    // If using Cloudflare R2, set endpoint
    if (this.endpoint) {
      config.endpoint = this.endpoint;
      config.s3ForcePathStyle = true; // Required for R2
    }

    this.s3 = new AWS.S3(config);
  }

  /**
   * Upload file ke S3/R2
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = "application/octet-stream"
  ): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: `uploads/${Date.now()}-${fileName}`,
        Body: fileBuffer,
        ContentType: contentType,
        // Jika public access, bisa tambah ACL: "public-read"
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error("Failed to upload file to S3");
    }
  }

  /**
   * Upload deposit proof
   */
  async uploadDepositProof(
    fileBuffer: Buffer,
    depositId: string,
    fileName: string
  ): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: `deposits/${depositId}/${Date.now()}-${fileName}`,
        Body: fileBuffer,
        ContentType: "image/jpeg", // or detect from fileName
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error("S3 deposit upload error:", error);
      throw new Error("Failed to upload deposit proof");
    }
  }

  /**
   * Upload product image
   */
  async uploadProductImage(
    fileBuffer: Buffer,
    productId: string,
    fileName: string
  ): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: `products/${productId}/${Date.now()}-${fileName}`,
        Body: fileBuffer,
        ContentType: "image/jpeg",
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error("S3 product upload error:", error);
      throw new Error("Failed to upload product image");
    }
  }

  /**
   * Delete file dari S3/R2
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error("Failed to delete file from S3");
    }
  }

  /**
   * Get signed URL untuk download file (berlaku 1 jam)
   */
  async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: expiresIn,
      };

      const url = this.s3.getSignedUrl("getObject", params);
      return url;
    } catch (error) {
      console.error("S3 signed URL error:", error);
      throw new Error("Failed to generate signed URL");
    }
  }

  /**
   * List files di folder tertentu
   */
  async listFiles(prefix: string = ""): Promise<AWS.S3.ObjectList | undefined> {
    try {
      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: 100,
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents;
    } catch (error) {
      console.error("S3 list error:", error);
      throw new Error("Failed to list files from S3");
    }
  }
}

// Export singleton instance
export const s3Storage = new S3StorageManager();
