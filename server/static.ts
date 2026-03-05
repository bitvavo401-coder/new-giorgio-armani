import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static asset files dengan explicit path matching
  app.use(express.static(distPath, {
    index: false, // Prevent serving index.html for directory access
  }));

  // NOT FOUND handler - serve index.html untuk SPA routing (HANYA untuk non-API paths)
  // Ini akan menjadi catch-all di akhir
  app.use((req: Request, res: Response) => {
    // Skip health checks dan API routes - mereka akan di-handle oleh routes
    if (req.path === '/health' || req.path === '/ready' || req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not Found' });
    }

    // Serve SPA index.html untuk semua path lainnya
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
