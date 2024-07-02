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
  const { email, password } = req.body;
  console.log("Received login request with email:", email);
  console.log("Received login request with password:", password); // Log password here

  if (!email || !password) {
    console.log("Email and password are required");
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    // Use Firebase Auth REST API to verify email and password
    const apiKey = "AIzaSyC_zbw6QLjNBrLsAiorx69sMymR42BxDbs"; // Replace with your Firebase web API key
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

      const userRecord = await admin.auth().getUser(localId);
      if (!userRecord.emailVerified) {
        return res.status(400).send({ message: "Email not verified" });
      }

      // Retrieve user information from Firestore
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(localId)
        .get();

      if (!userDoc.exists) {
        console.log(
          `User document for localId ${localId} not found in Firestore`
        );
        return res.status(400).send({ message: "User not found" });
      }

      const userData = userDoc.data();
      console.log("Retrieved user data from Firestore:", userData);

      const userRole = userData.userrole;
      const userName = userData.name;
      const userCourse = userData.course;

      const token = jwt.sign(
        {
          uid: userRecord.uid,
          role: userRole,
          name: userName,
          course: userCourse,
          email,
        },
        "YOUR_JWT_SECRET_KEY",
        {
          expiresIn: "1h",
        }
      );

      res.send({ token });
    } else {
      throw new Error("Invalid login credentials");
    }
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response?.data || error.message
    );
    res.status(400).send({ message: "Invalid credentials" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
