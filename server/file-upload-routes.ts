import { Router } from "express";
import multer from "multer";
import { s3Storage } from "./s3-storage";
import { storage } from "./storage";

// Setup multer untuk memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

export function setupFileUploadRoutes(router: Router) {
  /**
   * Upload deposit proof file
   * POST /api/deposits/:id/upload-proof
   */
  router.post("/api/deposits/:id/upload-proof", upload.single("proof"), async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "File required" });
      }

      // Check deposit exists
      const deposit = await storage.getDeposit(id);
      if (!deposit) {
        return res.status(404).json({ error: "Deposit not found" });
      }

      // Upload file ke S3/R2
      const fileUrl = await s3Storage.uploadDepositProof(
        file.buffer,
        id,
        file.originalname
      );

      // Update deposit dengan URL
      const updated = await storage.updateDeposit(id, {
        proofUrl: fileUrl,
      });

      res.json({
        message: "Proof uploaded successfully",
        deposit: updated,
        fileUrl,
      });
    } catch (error) {
      console.error("Upload proof error:", error);
      res.status(500).json({ error: "Failed to upload proof" });
    }
  });

  /**
   * Upload product image
   * POST /api/products/upload-image
   */
  router.post("/api/products/upload-image", upload.single("image"), async (req, res) => {
    try {
      const file = req.file;
      const { productId } = req.body;

      if (!file) {
        return res.status(400).json({ error: "Image file required" });
      }

      if (!productId) {
        return res.status(400).json({ error: "Product ID required" });
      }

      // Upload file ke S3/R2
      const imageUrl = await s3Storage.uploadProductImage(
        file.buffer,
        productId,
        file.originalname
      );

      // Update product dengan image URL
      const updated = await storage.updateProduct(productId, {
        imageUrl,
      });

      res.json({
        message: "Product image uploaded successfully",
        product: updated,
        imageUrl,
      });
    } catch (error) {
      console.error("Upload image error:", error);
      res.status(500).json({ error: "Failed to upload product image" });
    }
  });

  /**
   * Get file list (for admin dashboard)
   * GET /api/files/list
   */
  router.get("/api/files/list", async (req, res) => {
    try {
      const { prefix } = req.query;
      const files = await s3Storage.listFiles((prefix as string) || "");

      res.json({
        count: files?.length || 0,
        files: files?.map((f) => ({
          key: f.Key,
          size: f.Size,
          modified: f.LastModified,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  /**
   * Delete file (for admin dashboard)
   * DELETE /api/files/:fileKey
   */
  router.delete("/api/files/:fileKey", async (req, res) => {
    try {
      const { fileKey } = req.params;
      await s3Storage.deleteFile(fileKey);

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  /**
   * Get signed download URL
   * GET /api/files/download/:fileKey
   */
  router.get("/api/files/download/:fileKey", async (req, res) => {
    try {
      const { fileKey } = req.params;
      const { expiresIn } = req.query;

      const url = await s3Storage.getSignedUrl(
        fileKey,
        expiresIn ? parseInt(expiresIn as string) : 3600
      );

      res.json({ downloadUrl: url });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate download URL" });
    }
  });
}
