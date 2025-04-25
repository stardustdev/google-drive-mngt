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
    })
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
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
          scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
          accessType: "offline",
          prompt: "consent",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await googleAuthService.handleAuthCallback(
              accessToken,
              refreshToken,
              profile
            );
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  } else {
    console.warn("Google OAuth credentials missing. Authentication will be unavailable.");
  }

  // Serialize user into session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Auth routes - only register if Google credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google", {
      scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
      accessType: "offline",
      prompt: "consent"
    }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/");
      }
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

  app.post("/api/drive/upload", isAuthenticated, async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }

      const file = req.files.file;
      const result = await googleDriveService.uploadFile(req.user, file);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/drive/download/:fileId", isAuthenticated, async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const file = await googleDriveService.getFile(req.user, fileId);
      
      res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
      res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
      
      const fileStream = await googleDriveService.downloadFile(req.user, fileId);
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

  const httpServer = createServer(app);

  return httpServer;
}
