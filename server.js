import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import cors from "cors";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord.emailVerified) {
      return res.status(400).send({ message: "Email not verified" });
    }

    // Verify password (custom auth logic)
    const token = jwt.sign({ uid: userRecord.uid }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.send({ token });
  } catch (error) {
    res.status(400).send({ message: "Invalid credentials" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
