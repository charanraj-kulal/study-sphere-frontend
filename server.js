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

// Import the service account key with an import assertion
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173" })); // Adjust the origin to your frontend's address

//download document
// app.get("/api/document/:documentId", async (req, res) => {
//   const { documentId } = req.params;
//   const userId = req.query.userId; // Get the user ID from the query parameter

//   try {
//     // Fetch the document data from Firestore
//     const docRef = admin.firestore().collection("documents").doc(documentId);
//     const doc = await docRef.get();

//     if (!doc.exists) {
//       return res.status(404).send("Document not found");
//     }

//     const documentData = doc.data();
//     const documentUrl = documentData.documentUrl;
//     const documentName = documentData.documentName || "document";

//     // Check if the user has already downloaded this document
//     const downloadedUsers = documentData.downloadedUsers || {};
//     let shouldIncrementCount = false;

//     if (!downloadedUsers[userId]) {
//       // If the user hasn't downloaded this document before, update the downloadedUsers
//       shouldIncrementCount = true;
//       await docRef.update({
//         [`downloadedUsers.${userId}`]: "Yes",
//         downloadCount: admin.firestore.FieldValue.increment(1),
//       });
//     }

//     // Fetch the file from Firebase Storage
//     const response = await fetch(documentUrl);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // Set the appropriate headers for file download
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${documentName}.pdf"`
//     );
//     res.setHeader("Content-Type", "application/pdf");

//     // Pipe the file data to the response
//     response.body.pipe(res);

//     // Send the updated download count to the client
//     res.setHeader(
//       "X-Download-Count",
//       documentData.downloadCount + (shouldIncrementCount ? 1 : 0)
//     );
//   } catch (error) {
//     console.error("Error downloading file:", error);
//     res.status(500).send("Error downloading file");
//   }
// });

// app.get("/api/document/:documentId", async (req, res) => {
//   const { documentId } = req.params;

//   try {
//     const docRef = admin.firestore().collection("documents").doc(documentId);
//     const doc = await docRef.get();

//     if (!doc.exists) {
//       return res.status(404).json({ error: "Document not found" });
//     }

//     const documentData = doc.data();
//     res.json(documentData);
//   } catch (error) {
//     console.error("Error fetching document:", error);
//     res
//       .status(500)
//       .json({ error: "Error fetching document", details: error.message });
//   }
// });

app.get("/api/dowload/:documentId", async (req, res) => {
  const { documentId } = req.params;
  const userId = req.query.userId;

  try {
    const docRef = admin.firestore().collection("documents").doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send("Document not found");
    }

    const documentData = doc.data();
    const documentUrl = documentData.documentUrl;
    const documentName = documentData.documentName || "document";

    const downloadedUsers = documentData.downloadedUsers || {};
    let shouldIncrementCount = false;

    if (!downloadedUsers[userId]) {
      shouldIncrementCount = true;
      await docRef.update({
        [`downloadedUsers.${userId}`]: "Yes",
        downloadCount: admin.firestore.FieldValue.increment(1),
      });
    }

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();
    const updatedDownloadCount = updatedData.downloadCount;

    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${documentName}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("X-Download-Count", updatedDownloadCount);

    response.body.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
});

//email sending
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
      // from: '"Study-Sphere" <noreply@studysphere.com>',
      from: "charanraj9731@gmail.com",

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

  // Use template literal to interpolate values
  const htmlContent = eval("`" + emailTemplate + "`");

  try {
    await transporter.sendMail({
      from: '"Study-Sphere" <noreply@studysphere.com>',
      to: email,
      subject: "Welcome to Study-Sphere!",
      html: htmlContent,
    });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}
app.post("/login", async (req, res) => {
  console.log("Login endpoint hit");
  const { email, password } = req.body;
  console.log("Received login request with email:", email);

  if (!email || !password) {
    console.log("Email and password are required");
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    console.log("Attempting to authenticate with Firebase");
    const apiKey = process.env.FIREBASE_API_kEY; // Replace with your actual API key
    const authResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    if (authResponse.data && authResponse.data.idToken) {
      const { localId } = authResponse.data;

      try {
        const userRecord = await admin.auth().getUser(localId);
        console.log("User record retrieved:", userRecord);

        if (!userRecord.emailVerified) {
          console.log("Email not verified");
          return res.status(403).send({ message: "Email not verified" });
        }

        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(localId)
          .get();

        if (!userDoc.exists) {
          console.log("User not found in database");
          return res
            .status(404)
            .send({ message: "User not found in database" });
        }

        const userData = userDoc.data();
        console.log("Retrieved user data from Firestore:", userData);

        // Ensure `isVerified` status in Firestore matches email verification status
        if (userData.isVerified !== "Yes") {
          try {
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
          } catch (error) {
            console.error(
              "Error updating verification status or sending welcome email:",
              error
            );
            // You might want to handle this error appropriately
          }
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
          "YOUR_JWT_SECRET_KEY",
          {
            expiresIn: "1h",
          }
        );

        console.log("Sending response:", {
          token,
          displayName: userData.name,
          course: userData.course,
          uid: userRecord.uid,
          email,
          photoURL: userData.profilePhotoURL,
          userRole: userData.userrole,
          status: userData.status,
          isEmailVerified: true,
        });

        res.send({
          token,
          displayName: userData.name,
          course: userData.course,
          uid: userRecord.uid,
          email,
          photoURL: userData.profilePhotoURL,
          userRole: userData.userrole,
          status: userData.status,
          isEmailVerified: true,
        });
      } catch (error) {
        console.error("Error retrieving user data:", error);
        res.status(500).send({ message: "Error retrieving user data" });
      }
    } else {
      console.log("Invalid login credentials");
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response?.data || error.message
    );
    if (error.response && error.response.data && error.response.data.error) {
      switch (error.response.data.error.message) {
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
        default:
          return res.status(400).send({ message: "Authentication failed" });
      }
    }
    res.status(500).send({ message: "Server error during authentication" });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
