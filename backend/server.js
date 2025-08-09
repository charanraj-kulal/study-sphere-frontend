import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import nodemailer from "nodemailer";
import fs from "fs";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// Import the service account key
import serviceAccount from "./serviceAccountKey.js";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Express app FIRST
const app = express();
const port = process.env.PORT || 10000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://study-sphere-beryl.vercel.app",
  "https://study-sphere.com",
];

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request origin:", origin);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For development, allow localhost on any port
      if (
        process.env.MODE !== "production" &&
        origin &&
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Health check endpoint with environment info
app.get("/api/health", (req, res) => {
  const envCheck = {
    status: "OK",
    message: "Server is running",
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MODE: process.env.MODE,
      hasFirebaseApiKey:
        !!process.env.VITE_FIREBASE_API_KEY ||
        !!process.env.VITE_FIREBASE_API_KEY,
      hasJwtSecret: !!(
        process.env.JWT_SECRET || process.env.YOUR_JWT_SECRET_KEY
      ),
      hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      timestamp: new Date().toISOString(),
    },
  };

  console.log("Health check:", envCheck);
  res.json(envCheck);
});

//summary end point
app.get("/api/get-pdf-text/:documentId", async (req, res) => {
  const { documentId } = req.params;
  try {
    const docRef = admin.firestore().collection("documents").doc(documentId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }
    const { documentUrl } = doc.data();

    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    res.json({ text });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
});

//download end point
app.get("/api/download/:documentId", async (req, res) => {
  const { documentId } = req.params;
  const userId = req.query.userId;

  try {
    const docRef = admin.firestore().collection("documents").doc(documentId);
    const userRef = admin.firestore().collection("users").doc(userId);

    // Use a transaction to ensure atomic updates
    await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      const userDoc = await transaction.get(userRef);

      if (!doc.exists) {
        throw new Error("Document not found");
      }
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const documentData = doc.data();
      const userData = userDoc.data();
      const downloadedUsers = documentData.downloadedUsers || {};
      const currentDownloadCount = documentData.downloadCount || 0;
      const userPoints = userData.points || 0;
      const userDownloadCount = userData.downloadCount || 0;
      const userDownloadedDocs = userData.downloadedDocuments || [];

      // Check if the user has already downloaded this document
      if (!downloadedUsers[userId]) {
        downloadedUsers[userId] = true;
        const newDownloadCount = currentDownloadCount + 1;

        transaction.update(docRef, {
          downloadedUsers: downloadedUsers,
          downloadCount: newDownloadCount,
        });

        // Check if this is a new document for the user
        if (!userDownloadedDocs.includes(documentId)) {
          const newUserDownloadCount = userDownloadCount + 1;
          const newUserPoints = userPoints + 10;
          userDownloadedDocs.push(documentId);

          transaction.update(userRef, {
            downloadCount: newUserDownloadCount,
            downloadedDocuments: userDownloadedDocs,
            points: newUserPoints,
          });
        }
      }
    });

    // Fetch the file from Firebase Storage
    const documentData = (await docRef.get()).data();
    const documentUrl = documentData.documentUrl;
    const response = await fetch(documentUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Set the appropriate headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${documentData.documentName || "document"}.pdf"`
    );

    // Pipe the file data to the response
    response.body.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: error.message || "Error downloading file" });
  }
});

//email sending
app.post("/api/send-contact-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: "webhookstudio@gmail.com",
      subject: subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email");
  }
});

app.post("/api/send-welcome-email", async (req, res) => {
  const { name, email, course, userrole } = req.body;

  // Read the email template
  const templatePath = path.join(__dirname, "welcome_email.html");
  let emailTemplate = fs.readFileSync(templatePath, "utf8");

  // Replace placeholders with actual user data
  emailTemplate = emailTemplate.replace(
    "User Name           :      Status",
    `User Name           :      ${name}`
  );
  emailTemplate = emailTemplate.replace(
    "User Course         :      Status",
    `User Course         :      ${course}`
  );
  emailTemplate = emailTemplate.replace(
    "Role                :      Status",
    `Role                :      ${userrole === 3 ? "Student" : "Other"}`
  );

  // Send email
  try {
    await transporter.sendMail({
      from: '"Study-Sphere" <noreply@studysphere.com>',
      to: email,
      subject: "Welcome to Study-Sphere!",
      html: emailTemplate,
    });

    res.status(200).json({ message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send welcome email" });
  }
});

async function sendWelcomeEmail(name, email, course, userrole) {
  const templatePath = path.join(__dirname, "welcome_email.html");
  let emailTemplate = fs.readFileSync(templatePath, "utf8");

  // Use template literal to interpolate values (safer replacement)
  emailTemplate = emailTemplate.replace(/\${name}/g, name);
  emailTemplate = emailTemplate.replace(/\${email}/g, email);
  emailTemplate = emailTemplate.replace(/\${course}/g, course);
  emailTemplate = emailTemplate.replace(/\${userrole}/g, userrole);

  try {
    await transporter.sendMail({
      from: '"Study-Sphere" <noreply@studysphere.com>',
      to: email,
      subject: "Welcome to Study-Sphere!",
      html: emailTemplate,
    });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}

// Enhanced login endpoint with better error handling and debugging
app.post("/login", async (req, res) => {
  console.log("=== LOGIN ATTEMPT START ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    MODE: process.env.MODE,
    hasApiKey: !!(
      process.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY
    ),
    port: process.env.PORT,
  });

  const { email, password } = req.body;
  console.log("Received login request with email:", email);

  if (!email || !password) {
    console.log("❌ Missing credentials");
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    // Check for API key with better error handling
    const apiKey =
      process.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

    if (!apiKey) {
      console.error("❌ Firebase API key not found in environment variables");
      console.log(
        "Available env vars:",
        Object.keys(process.env).filter(
          (key) => key.includes("FIREBASE") || key.includes("API")
        )
      );
      return res.status(500).send({
        message: "Server configuration error: Firebase API key missing",
        debug:
          process.env.NODE_ENV === "development"
            ? "VITE_FIREBASE_API_KEY not found"
            : undefined,
      });
    }

    console.log(
      "🔑 Using Firebase API key (first 10 chars):",
      apiKey.substring(0, 10) + "..."
    );
    console.log("🚀 Attempting Firebase authentication...");

    const authResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      },
      {
        timeout: 10000, // 10 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Firebase auth successful");

    if (authResponse.data && authResponse.data.idToken) {
      const { localId } = authResponse.data;
      console.log("👤 User ID:", localId);

      try {
        const userRecord = await admin.auth().getUser(localId);
        console.log(
          "📋 User record retrieved, email verified:",
          userRecord.emailVerified
        );

        if (!userRecord.emailVerified) {
          console.log("❌ Email not verified");
          return res.status(403).send({ message: "Email not verified" });
        }

        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(localId)
          .get();

        if (!userDoc.exists) {
          console.log("❌ User not found in Firestore");
          return res
            .status(404)
            .send({ message: "User not found in database" });
        }

        const userData = userDoc.data();
        console.log(
          "📊 Retrieved user data from Firestore - role:",
          userData.userrole,
          "name:",
          userData.name
        );

        // Ensure `isVerified` status in Firestore matches email verification status
        if (userData.isVerified !== "Yes") {
          try {
            console.log("🔄 Updating verification status...");
            await admin
              .firestore()
              .collection("users")
              .doc(userRecord.uid)
              .update({
                isVerified: "Yes",
              });
            userData.isVerified = "Yes";

            // Send welcome email
            await sendWelcomeEmail(
              userData.name,
              email,
              userData.course,
              userData.userrole
            );
            console.log("📧 Welcome email sent");
          } catch (error) {
            console.error(
              "⚠️ Error updating verification status or sending welcome email:",
              error
            );
            // Continue with login even if email fails
          }
        }

        // Use environment variable for JWT secret
        const jwtSecret =
          process.env.JWT_SECRET ||
          process.env.YOUR_JWT_SECRET_KEY ||
          "fallback-secret-key";

        if (jwtSecret === "fallback-secret-key") {
          console.warn(
            "⚠️ Using fallback JWT secret - not recommended for production"
          );
        }

        const token = jwt.sign(
          {
            uid: userRecord.uid,
            role: userData.userrole,
            name: userData.name,
            course: userData.course,
            email,
            profilePhotoURL: userData.profilePhotoURL,
            status: userData.status,
            isEmailVerified: true,
          },
          jwtSecret,
          {
            expiresIn: "1h",
          }
        );

        const responseData = {
          token,
          displayName: userData.name,
          course: userData.course,
          uid: userRecord.uid,
          email,
          photoURL: userData.profilePhotoURL,
          userRole: userData.userrole,
          status: userData.status,
          isEmailVerified: true,
        };

        console.log("✅ Login successful for user:", userData.name);
        console.log("=== LOGIN ATTEMPT END ===");

        res.send(responseData);
      } catch (firestoreError) {
        console.error(
          "❌ Error retrieving user data from Firestore:",
          firestoreError
        );
        res.status(500).send({
          message: "Error retrieving user data",
          debug:
            process.env.NODE_ENV === "development"
              ? firestoreError.message
              : undefined,
        });
      }
    } else {
      console.log("❌ Invalid response from Firebase - no idToken");
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("❌ Authentication error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      },
    });

    // Handle specific Firebase Auth errors
    if (error.response && error.response.data && error.response.data.error) {
      const firebaseError = error.response.data.error;
      console.log("🔍 Firebase error details:", firebaseError);

      switch (firebaseError.message) {
        case "EMAIL_NOT_FOUND":
          return res.status(404).send({ message: "Email not found" });
        case "INVALID_PASSWORD":
          return res.status(401).send({ message: "Invalid password" });
        case "USER_DISABLED":
          return res
            .status(403)
            .send({ message: "User account has been disabled" });
        case "INVALID_LOGIN_CREDENTIALS":
          return res.status(401).send({ message: "Invalid email or password" });
        case "TOO_MANY_ATTEMPTS_TRY_LATER":
          return res.status(429).send({
            message: "Too many failed attempts. Please try again later.",
          });
        case "INVALID_EMAIL":
          return res.status(400).send({ message: "Invalid email format" });
        default:
          console.log("🔍 Unknown Firebase error:", firebaseError.message);
          return res.status(400).send({
            message: "Authentication failed",
            debug:
              process.env.NODE_ENV === "development"
                ? firebaseError.message
                : undefined,
          });
      }
    }

    // Handle network/timeout errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return res
        .status(504)
        .send({ message: "Request timeout. Please try again." });
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return res
        .status(503)
        .send({ message: "Service temporarily unavailable" });
    }

    console.log("=== LOGIN ATTEMPT FAILED ===");
    res.status(500).send({
      message: "Server error during authentication",
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.delete("/api/users/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Delete user from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "auth/user-not-found") {
      // If the user is not found in Authentication, try to delete from Firestore only
      try {
        await admin.firestore().collection("users").doc(uid).delete();
        res
          .status(200)
          .send({ message: "User deleted from Firestore successfully" });
      } catch (firestoreError) {
        console.error("Error deleting user from Firestore:", firestoreError);
        res.status(500).send({
          message: "Error deleting user from Firestore",
          error: firestoreError.message,
        });
      }
    } else {
      res
        .status(500)
        .send({ message: "Error deleting user", error: error.message });
    }
  }
});

async function sendApprovalEmail(
  userEmail,
  documentName,
  verifiedBy,
  verifiedOn,
  uploadedOn
) {
  console.log(
    `Sending approval email to ${userEmail} for document: ${documentName}`
  );

  const templatePath = path.join(__dirname, "approved_email.html");
  let emailTemplate = fs.readFileSync(templatePath, "utf8");

  // Format only the verifiedOn date
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";

    let date = new Date(dateInput);

    // Check if the date is valid
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formattedVerifiedOn = formatDate(verifiedOn);

  // Replace placeholders with actual data
  emailTemplate = emailTemplate.replace(/docname/g, documentName || "N/A");
  emailTemplate = emailTemplate.replace(/dtofup/g, uploadedOn || "N/A"); // Use uploadedOn directly
  emailTemplate = emailTemplate.replace(/verifierName/g, verifiedBy || "N/A");
  emailTemplate = emailTemplate.replace(/Verified/g, formattedVerifiedOn);

  // Remove the extra "Approved" text (if present in the template)
  emailTemplate = emailTemplate.replace(
    "Approved On        :  Approved",
    "Approved On        :"
  );

  try {
    const info = await transporter.sendMail({
      from: '"Study-Sphere" <noreply@studysphere.com>',
      to: userEmail,
      subject: `Your document  ${documentName} has been approved!`,
      html: emailTemplate,
    });

    console.log(
      "Approval email sent successfully. Message ID:",
      info.messageId
    );
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw error;
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});
app.post("/api/approve-document", async (req, res) => {
  const { documentId, userEmail, documentName, verifiedBy } = req.body;

  try {
    console.log(`Approving document: ${documentId} for user: ${userEmail}`);

    const verifiedOn = new Date().toISOString();

    // Fetch the document from Firestore to get the uploadedOn date
    const docRef = admin.firestore().collection("documents").doc(documentId);
    const docSnapshot = await docRef.get();
    const uploadedOn = docSnapshot.data().uploadedOn;

    // Update the document in Firestore
    await docRef.update({
      Approved: "Yes",
      verifiedBy: verifiedBy,
      verifiedOn: verifiedOn,
    });

    console.log("Firestore update successful");

    // Send approval email with correct dates
    await sendApprovalEmail(
      userEmail,
      documentName,
      verifiedBy,
      verifiedOn,
      uploadedOn
    );

    console.log("Approval email sent successfully");

    res.status(200).json({ message: "Document approved and email sent" });
  } catch (error) {
    console.error("Error in /api/approve-document:", error);
    res
      .status(500)
      .json({ error: "Failed to approve document", details: error.message });
  }
});
async function sendRejectionEmail(
  userEmail,
  documentName,
  verifiedBy,
  verifiedOn,
  rejectionReason
) {
  console.log(
    `Sending rejection email to ${userEmail} for document: ${documentName}`
  );

  const templatePath = path.join(__dirname, "rejected_email.html");
  let emailTemplate = fs.readFileSync(templatePath, "utf8");

  // Format the verifiedOn date
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    let date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formattedVerifiedOn = formatDate(verifiedOn);

  // Replace placeholders with actual data
  emailTemplate = emailTemplate.replace(/docname/g, documentName || "N/A");
  emailTemplate = emailTemplate.replace(/reason/g, rejectionReason || "N/A");
  emailTemplate = emailTemplate.replace(/verifierName/g, verifiedBy || "N/A");
  emailTemplate = emailTemplate.replace(/Verified/g, formattedVerifiedOn);

  try {
    const info = await transporter.sendMail({
      from: '"Study-Sphere" <noreply@studysphere.com>',
      to: userEmail,
      subject: `Your document  ${documentName} has been rejected`,
      html: emailTemplate,
    });

    console.log(
      "Rejection email sent successfully. Message ID:",
      info.messageId
    );
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
}

app.post("/api/reject-document", async (req, res) => {
  const { documentId, userEmail, documentName, verifiedBy, rejectionReason } =
    req.body;

  try {
    console.log(`Rejecting document: ${documentId} for user: ${userEmail}`);

    const verifiedOn = new Date().toISOString();

    // Update the document in Firestore
    await admin.firestore().collection("documents").doc(documentId).update({
      Approved: "Rejected",
      rejectionReason: rejectionReason,
      verifiedBy: verifiedBy,
      verifiedOn: verifiedOn,
    });

    console.log("Firestore update successful");

    // Send rejection email
    await sendRejectionEmail(
      userEmail,
      documentName,
      verifiedBy,
      verifiedOn,
      rejectionReason
    );

    console.log("Rejection email sent successfully");

    res.status(200).json({ message: "Document rejected and email sent" });
  } catch (error) {
    console.error("Error in /api/reject-document:", error);
    res
      .status(500)
      .json({ error: "Failed to reject document", details: error.message });
  }
});
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
