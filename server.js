import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Import the service account key with an import assertion
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173" })); // Adjust the origin to your frontend's address

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
          await admin
            .firestore()
            .collection("users")
            .doc(userRecord.uid)
            .update({
              isVerified: "Yes",
            });
          userData.isVerified = "Yes";
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
          email,
          photoURL: userData.profilePhotoURL,
          userRole: userData.userrole,
          status: userData.status,
          isEmailVerified: true,
        });

        res.send({
          token,
          displayName: userData.name,
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
