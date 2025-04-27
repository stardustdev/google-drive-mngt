import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import session from "express-session";
import { OAuth2Strategy } from "passport-google-oauth";
import { googleAuthService } from "./services/googleAuthService";
import { googleDriveService } from "./services/googleDriveService";
import memorystore from "memorystore";
import * as fs from "fs";
import * as path from "path";

const MemoryStore = memorystore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "google-drive-manager-secret",
    }),
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth strategy if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new OAuth2Strategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            "http://localhost:5000/api/auth/google/callback",
          scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
          accessType: "offline",
          prompt: "consent",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await googleAuthService.handleAuthCallback(
              accessToken,
              refreshToken,
              profile,
            );
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        },
      ),
    );
  } else {
    console.warn(
      "Google OAuth credentials missing. Authentication will be unavailable.",
    );
  }

  // Serialize user into session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  console.log(
    "Registering routes:",
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  // Auth routes - only register if Google credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
        accessType: "offline",
        prompt: "consent",
      }),
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/");
      },
    );
  } else {
    // Fallback routes for development without OAuth credentials
    app.get("/api/auth/google", (req, res) => {
      res.status(503).json({ message: "Google OAuth is not configured" });
    });

    app.get("/api/auth/google/callback", (req, res) => {
      res.redirect("/?error=oauth_not_configured");
    });
  }

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    return res.status(401).json({ message: "Unauthorized" });
  });

  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Google Drive API routes
  app.get("/api/drive/files", isAuthenticated, async (req, res) => {
    try {
      const files = await googleDriveService.listFiles(req.user);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get a specific file or folder by ID
  app.get("/api/drive/files/:fileId", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const file = await googleDriveService.getFile(req.user, fileId);
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/drive/upload", isAuthenticated, async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }

      const file = req.files.file;
      const parentFolderId = req.body.parentFolderId;
      
      // Pass the parent folder ID if available
      const result = await googleDriveService.uploadFile(req.user, file, parentFolderId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/drive/download/:fileId", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const file = await googleDriveService.getFile(req.user, fileId);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name}"`,
      );
      res.setHeader(
        "Content-Type",
        file.mimeType || "application/octet-stream",
      );

      const fileStream = await googleDriveService.downloadFile(
        req.user,
        fileId,
      );
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Endpoint for file download with custom filename
  app.get("/api/drive/files/:fileId/download", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const filename = req.query.filename || '';
      const file = await googleDriveService.getFile(req.user, fileId);
      
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename || file.name}"`,
      );
      res.setHeader(
        "Content-Type",
        file.mimeType || "application/octet-stream",
      );
      
      const fileStream = await googleDriveService.downloadFile(
        req.user,
        fileId,
      );
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get file content for preview
  app.get("/api/drive/files/:fileId/content", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const file = await googleDriveService.getFile(req.user, fileId);

      // Set appropriate content type
      res.setHeader(
        "Content-Type",
        file.mimeType || "application/octet-stream",
      );
      
      // For preview, we don't want to force download
      // No Content-Disposition header for inline viewing

      const fileStream = await googleDriveService.downloadFile(
        req.user,
        fileId,
      );
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/drive/files/:fileId", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      await googleDriveService.deleteFile(req.user, fileId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Create a new folder
  app.post("/api/drive/folders", isAuthenticated, async (req, res) => {
    try {
      const { name, parentId } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Folder name is required" });
      }
      
      const folder = await googleDriveService.createFolder(
        req.user, 
        name, 
        parentId
      );
      
      res.json(folder);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // List folder contents
  app.get("/api/drive/folders/:folderId/files", isAuthenticated, async (req, res) => {
    try {
      const folderId = req.params.folderId;
      const files = await googleDriveService.listFolderContents(req.user, folderId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Move a file to a different folder
  app.patch("/api/drive/files/:fileId/move", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const { targetFolderId, removeFromParents } = req.body;
      
      if (!targetFolderId) {
        return res.status(400).json({ message: "Target folder ID is required" });
      }
      
      const updatedFile = await googleDriveService.moveFile(
        req.user,
        fileId,
        targetFolderId,
        removeFromParents
      );
      
      res.json(updatedFile);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Search for files
  app.get("/api/drive/search", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const files = await googleDriveService.searchFiles(req.user, query);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Share a file with another user
  app.post("/api/drive/share", isAuthenticated, async (req, res) => {
    try {
      const { fileId, emailAddress, role, sendNotification } = req.body;
      
      if (!fileId || !emailAddress) {
        return res.status(400).json({ message: "fileId and emailAddress are required" });
      }
      
      const permission = await googleDriveService.shareFile(
        req.user, 
        fileId, 
        emailAddress, 
        role || 'reader', 
        sendNotification !== false
      );
      
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get file permissions
  app.get("/api/drive/permissions/:fileId", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      
      if (!fileId) {
        return res.status(400).json({ message: "fileId is required" });
      }
      
      const permissions = await googleDriveService.getFilePermissions(req.user, fileId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Remove file permission
  app.delete("/api/drive/permissions/:fileId/:permissionId", isAuthenticated, async (req, res) => {
    try {
      const { fileId, permissionId } = req.params;
      
      if (!fileId || !permissionId) {
        return res.status(400).json({ message: "fileId and permissionId are required" });
      }
      
      await googleDriveService.removeFilePermission(req.user, fileId, permissionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Get Google Drive storage usage
  app.get("/api/drive/storage", isAuthenticated, async (req, res) => {
    try {
      const storageInfo = await googleDriveService.getStorageUsage(req.user);
      res.json(storageInfo);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
