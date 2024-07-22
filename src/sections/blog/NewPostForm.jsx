import React, { useState } from "react";
import { TextField, Button, Box, Popover } from "@mui/material";
import ReactQuill from "react-quill"; // We'll use React-Quill for the rich text editor
import "react-quill/dist/quill.snow.css"; // Quill styles
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust the import path as needed
import { useUser } from "../../hooks/UserContext";

const NewPostForm = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { userData } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "blogs"), {
        title,
        content,
        blogPostDate: serverTimestamp(),
        blogPosterUid: userData.uid,
        viewCount: 0,
        shareCount: 0,
        commentCount: 0,
        reportCount: 0,
        sharedUsers: [],
        viewedUsers: [],
      });
      console.log("Document written with ID: ", docRef.id);
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Blog Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
      />
      <ReactQuill
        value={content}
        onChange={setContent}
        style={{ height: "300px", marginBottom: "50px" }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Post
      </Button>
    </Box>
  );
};

export default NewPostForm;
