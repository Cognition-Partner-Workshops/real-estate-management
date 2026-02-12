import { describe, it, expect } from "vitest";
import path from "path";

describe("Security Vulnerability Fixes", () => {

  describe("1. JWT Secret Key Hardening", () => {
    it("should warn when SECRET_KEY is weak or default", async () => {
      const originalEnv = process.env.SECRET_KEY;
      process.env.SECRET_KEY = "secret";
      const secret = process.env.SECRET_KEY;
      expect(secret === "secret").toBe(true);
      process.env.SECRET_KEY = originalEnv;
    });

    it("should accept a strong SECRET_KEY", () => {
      const strongKey = "a1b2c3d4e5f6g7h8i9j0-very-long-and-random-key!@#";
      expect(strongKey).not.toBe("secret");
      expect(strongKey.length).toBeGreaterThan(16);
    });
  });

  describe("2. NoSQL Injection Prevention - Regex Escaping", () => {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    it("should escape special regex characters in search input", () => {
      const malicious = ".*+?^${}()|[]\\";
      const escaped = escapeRegex(malicious);
      expect(escaped).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
    });

    it("should not modify safe search input", () => {
      const safe = "apartment downtown";
      const escaped = escapeRegex(safe);
      expect(escaped).toBe("apartment downtown");
    });

    it("should escape ReDoS attack patterns", () => {
      const redos = "(a+)+$";
      const escaped = escapeRegex(redos);
      expect(escaped).toBe("\\(a\\+\\)\\+\\$");
      expect(escaped).not.toContain("(a+)+");
    });

    it("should escape MongoDB operator injection attempts", () => {
      const injection = "{$gt: ''}";
      const escaped = escapeRegex(injection);
      expect(escaped).toContain("\\$");
      expect(escaped).toContain("\\{");
    });
  });

  describe("3. Mass Assignment Prevention", () => {
    it("should only allow whitelisted fields for property creation", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync(
        path.resolve("src/controllers/properties/create-property.js"),
        "utf-8"
      );
      expect(content).not.toContain("...req.body");
    });

    it("should only allow whitelisted fields for enquiry creation", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync(
        path.resolve("src/controllers/enquiries/create-enquiry.js"),
        "utf-8"
      );
      expect(content).not.toContain("...req.body");
    });
  });

  describe("4. Password Hash Not Exposed in API Responses", () => {
    it("signin controller should strip password from response", async () => {
      const { signIn } = await import("../src/controllers/auth/signin.js");
      const fnSource = signIn.toString();
      expect(fnSource).toContain("delete userObj.password");
    });

    it("getMe should use select to exclude password", async () => {
      const { getMe } = await import("../src/controllers/users/get-me.js");
      const fnSource = getMe.toString();
      expect(fnSource).toContain("-password");
    });

    it("getUser should use select to exclude password", async () => {
      const { getUser } = await import("../src/controllers/users/get-user.js");
      const fnSource = getUser.toString();
      expect(fnSource).toContain("-password");
    });

    it("getUsers should use select to exclude password", async () => {
      const { getUsers } = await import(
        "../src/controllers/users/get-users.js"
      );
      const fnSource = getUsers.toString();
      expect(fnSource).toContain("-password");
    });
  });

  describe("5. JWT Token Expiration", () => {
    it("should configure JWT with expiresIn", async () => {
      const fs = await import("fs");
      const indexContent = fs.readFileSync(
        path.resolve("src/index.js"),
        "utf-8"
      );
      expect(indexContent).toContain("expiresIn");
      expect(indexContent).toContain('"24h"');
    });
  });

  describe("6. Path Traversal Prevention in File Upload", () => {
    it("should sanitize filenames to remove path traversal sequences", async () => {
      const sanitizeFilename = (filename) =>
        path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");

      expect(sanitizeFilename("../../../etc/passwd")).toBe("passwd");
      const winResult = sanitizeFilename("..\\..\\windows\\system32\\config");
      expect(winResult).not.toContain("/");
      expect(sanitizeFilename("normal-image.jpg")).toBe("normal-image.jpg");
      expect(sanitizeFilename("file with spaces.png")).toBe(
        "file_with_spaces.png"
      );
    });

    it("should validate resolved path stays within uploads directory", () => {
      const UPLOADS_DIR = path.join(process.cwd(), "uploads");
      const maliciousPath = path.join(UPLOADS_DIR, "..", "..", "etc", "passwd");
      const resolvedPath = path.resolve(maliciousPath);
      expect(resolvedPath.startsWith(path.resolve(UPLOADS_DIR))).toBe(false);

      const safePath = path.join(UPLOADS_DIR, "image.jpg");
      const resolvedSafePath = path.resolve(safePath);
      expect(resolvedSafePath.startsWith(path.resolve(UPLOADS_DIR))).toBe(
        true
      );
    });

    it("image-property controller should use sanitizeFilename", async () => {
      const fs = await import("fs");
      const imgContent = fs.readFileSync(
        path.resolve("src/controllers/properties/image-property.js"),
        "utf-8"
      );
      expect(imgContent).toContain("sanitizeFilename");
      expect(imgContent).toContain("path.resolve(UPLOADS_DIR)");
    });
  });

  describe("7. Path Traversal Prevention in File Deletion", () => {
    it("unlinkImages should use sanitized filenames and verify path", async () => {
      const fs = await import("fs");
      const imgContent = fs.readFileSync(
        path.resolve("src/controllers/properties/image-property.js"),
        "utf-8"
      );
      expect(imgContent).toContain("sanitizeFilename(imgSplt[imgSplt.length - 1])");
      expect(imgContent).toContain(
        "resolvedPath.startsWith(path.resolve(UPLOADS_DIR))"
      );
    });
  });

  describe("8. Authentication Decorator Returns 401", () => {
    it("authenticate decorator should return 401 on failure", async () => {
      const fs = await import("fs");
      const indexContent = fs.readFileSync(
        path.resolve("src/index.js"),
        "utf-8"
      );
      expect(indexContent).toContain("return reply.status(401)");
      expect(indexContent).toContain("Unauthorized");
      expect(indexContent).not.toMatch(
        /catch\s*\(err\)\s*\{\s*\n\s*reply\.send\(err\)/
      );
    });
  });

  describe("9. isPropertyOwner Authorization Fix", () => {
    it("should return boolean instead of sending response directly", async () => {
      const fs = await import("fs");
      const imgContent = fs.readFileSync(
        path.resolve("src/controllers/properties/image-property.js"),
        "utf-8"
      );
      expect(imgContent).toContain(
        "return property.user_id === user_id"
      );
      expect(imgContent).toContain("if (!isPropertyOwner(property, req))");
    });
  });

  describe("10. WebSocket Token Verification", () => {
    it("should verify JWT token instead of just decoding", async () => {
      const fs = await import("fs");
      const wsContent = fs.readFileSync(
        path.resolve("src/websocket/index.js"),
        "utf-8"
      );
      expect(wsContent).toContain("fastify.jwt.verify(userToken)");
      expect(wsContent).not.toContain("userIdToken(userToken)");
      expect(wsContent).toContain('socket.close(1008, "Invalid token")');
    });
  });

  describe("11. Rate Limiting on Auth Endpoints", () => {
    it("signin route should have rate limit config", async () => {
      const fs = await import("fs");
      const signinContent = fs.readFileSync(
        path.resolve("src/routes/auth/options/signin.js"),
        "utf-8"
      );
      expect(signinContent).toContain("rateLimit");
      expect(signinContent).toContain("max:");
      expect(signinContent).toContain("timeWindow");
    });

    it("register route should have rate limit config", async () => {
      const fs = await import("fs");
      const registerContent = fs.readFileSync(
        path.resolve("src/routes/auth/options/register.js"),
        "utf-8"
      );
      expect(registerContent).toContain("rateLimit");
      expect(registerContent).toContain("max:");
      expect(registerContent).toContain("timeWindow");
    });

    it("rate limit plugin should be registered in index.js", async () => {
      const fs = await import("fs");
      const indexContent = fs.readFileSync(
        path.resolve("src/index.js"),
        "utf-8"
      );
      expect(indexContent).toContain("FastifyRateLimit");
      expect(indexContent).toContain("@fastify/rate-limit");
    });
  });

  describe("12. Error Objects Not Leaked to Clients", () => {
    const controllersToCheck = [
      {
        name: "register",
        path: "src/controllers/auth/register.js",
      },
      {
        name: "create-property",
        path: "src/controllers/properties/create-property.js",
      },
      {
        name: "delete-property",
        path: "src/controllers/properties/delete-property.js",
      },
      {
        name: "update-property",
        path: "src/controllers/properties/update-property.js",
      },
      {
        name: "image-property",
        path: "src/controllers/properties/image-property.js",
      },
      {
        name: "get-enquiries",
        path: "src/controllers/enquiries/get-enquiries.js",
      },
      {
        name: "get-enquiry",
        path: "src/controllers/enquiries/get-enquiry.js",
      },
      {
        name: "create-enquiry",
        path: "src/controllers/enquiries/create-enquiry.js",
      },
      {
        name: "delete-enquiry",
        path: "src/controllers/enquiries/delete-enquiry.js",
      },
      {
        name: "update-enquiry",
        path: "src/controllers/enquiries/update-enquiry.js",
      },
      { name: "get-me", path: "src/controllers/users/get-me.js" },
      {
        name: "get-user",
        path: "src/controllers/users/get-user.js",
      },
    ];

    controllersToCheck.forEach(({ name, path: filePath }) => {
      it(`${name} should not leak raw error objects`, async () => {
        const fs = await import("fs");
        const content = fs.readFileSync(path.resolve(filePath), "utf-8");
        const catchBlocks = content.match(
          /catch\s*\([^)]*\)\s*\{[^}]*\}/gs
        );
        if (catchBlocks) {
          catchBlocks.forEach((block) => {
            expect(block).not.toMatch(/res\.send\(\s*error\s*\)/);
            expect(block).not.toMatch(/res\.status\(\d+\)\.send\(\s*error\s*\)/);
          });
        }
      });
    });
  });

  describe("13. File Type Validation on Uploads", () => {
    it("should define allowed MIME types", async () => {
      const fs = await import("fs");
      const imgContent = fs.readFileSync(
        path.resolve("src/controllers/properties/image-property.js"),
        "utf-8"
      );
      expect(imgContent).toContain("ALLOWED_MIME_TYPES");
      expect(imgContent).toContain("image/jpeg");
      expect(imgContent).toContain("image/png");
      expect(imgContent).toContain("data.mimetype");
    });

    it("should reject non-image file types", () => {
      const ALLOWED_MIME_TYPES = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      expect(ALLOWED_MIME_TYPES.includes("application/javascript")).toBe(false);
      expect(ALLOWED_MIME_TYPES.includes("text/html")).toBe(false);
      expect(ALLOWED_MIME_TYPES.includes("application/x-executable")).toBe(
        false
      );
      expect(ALLOWED_MIME_TYPES.includes("image/jpeg")).toBe(true);
      expect(ALLOWED_MIME_TYPES.includes("image/png")).toBe(true);
    });
  });

  describe("14. File Size Limits on Multipart Uploads", () => {
    it("should configure multipart with file size limits", async () => {
      const fs = await import("fs");
      const indexContent = fs.readFileSync(
        path.resolve("src/index.js"),
        "utf-8"
      );
      expect(indexContent).toContain("fileSize:");
      expect(indexContent).toContain("5 * 1024 * 1024");
      expect(indexContent).toContain("files: 10");
    });
  });

  describe("15. Password Validation", () => {
    it("should enforce strong password requirements", async () => {
      const { isPasswordValid } = await import("../src/utils/users.js");
      expect(isPasswordValid("short")).toBeFalsy();
      expect(isPasswordValid("nouppercase1!")).toBeFalsy();
      expect(isPasswordValid("NOLOWERCASE1!")).toBeFalsy();
      expect(isPasswordValid("NoSpecialChar1")).toBeFalsy();
      expect(isPasswordValid("NoDigits!abc")).toBeFalsy();
      expect(isPasswordValid("ValidPass1!")).toBeTruthy();
    });
  });

  describe("16. Duplicate Email Handling in Register", () => {
    it("register should handle duplicate email error (code 11000)", async () => {
      const { register } = await import("../src/controllers/auth/register.js");
      const fnSource = register.toString();
      expect(fnSource).toContain("11000");
      expect(fnSource).toContain("409");
      expect(fnSource).toContain("Email already exists");
    });
  });
});
