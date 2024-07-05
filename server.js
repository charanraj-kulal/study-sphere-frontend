import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";

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
    const apiKey = "AIzaSyC_zbw6QLjNBrLsAiorx69sMymR42BxDbs";
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

        if (!userRecord.emailVerified) {
          return res.status(403).send({ message: "Email not verified" });
        }

        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(localId)
          .get();

        if (!userDoc.exists) {
          return res
            .status(404)
            .send({ message: "User not found in database" });
        }

        const userData = userDoc.data();
        const isEmailVerified = userRecord.emailVerified;
        console.log(isEmailVerified);
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
        console.log("Retrieved user data from Firestore:", userData);

        const userRole = userData.userrole;
        const userName = userData.name;
        const userCourse = userData.course;
        const profilePhotoURL = userData.profilePhotoURL;
        const status = userData.status;

        console.log("Generating JWT token");
        const token = jwt.sign(
          {
            uid: userRecord.uid,
            role: userRole,
            name: userName,
            course: userCourse,
            email,
            profilePhotoURL,
            status,
            isEmailVerified,
          },
          "YOUR_JWT_SECRET_KEY",
          {
            expiresIn: "1h",
          }
        );

        console.log("Sending response:", {
          token,
          displayName: userName,
          email,
          photoURL: profilePhotoURL,
          userRole,
          status,
          isEmailVerified: true,
        });

        res.send({
          token,
          displayName: userName,
          email,
          photoURL: profilePhotoURL,
          userRole,
          status,
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
