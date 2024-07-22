import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import ReplyIcon from "@mui/icons-material/Reply";
import DeleteIcon from "@mui/icons-material/Delete";
import Iconify from "../../components/iconify/iconify";
import { useUser } from "../../hooks/UserContext";

const CommentSection = ({ blogId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const commentRefs = useRef({});
  const { userData } = useUser();
  const currentUserUid = userData.uid;

  useEffect(() => {
    const q = query(
      collection(db, `blogs/${blogId}/comments`),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [blogId]);

  const handleSubmitComment = async () => {
    if (newComment.trim() === "") return;

    try {
      const commentData = {
        text: newComment,
        userId: userData.uid,
        userName: userData.displayName,
        userPhotoUrl: userData.photoURL,
        timestamp: new Date(),
        likes: [],
        replies: [],
      };

      if (replyingTo) {
        commentData.replyTo = {
          id: replyingTo.id,
          userName: replyingTo.userName,
          text: replyingTo.text,
        };
      }

      await addDoc(collection(db, `blogs/${blogId}/comments`), commentData);

      // Increment commentCount in the blog document
      const blogRef = doc(db, "blogs", blogId);
      await updateDoc(blogRef, {
        commentCount: increment(1),
      });

      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.userName} `);
  };

  const handleLike = async (comment) => {
    const commentRef = doc(db, `blogs/${blogId}/comments`, comment.id);
    if (comment.likes.includes(currentUserUid)) {
      await updateDoc(commentRef, {
        likes: arrayRemove(currentUserUid),
      });
    } else {
      await updateDoc(commentRef, {
        likes: arrayUnion(currentUserUid),
      });
    }
  };

  const handleDelete = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const confirmDelete = async () => {
    if (deleteCommentId) {
      try {
        await deleteDoc(doc(db, `blogs/${blogId}/comments`, deleteCommentId));

        // Decrement commentCount in the blog document
        const blogRef = doc(db, "blogs", blogId);
        await updateDoc(blogRef, {
          commentCount: increment(-1),
        });

        setDeleteCommentId(null);
      } catch (error) {
        console.error("Error deleting comment: ", error);
      }
    }
  };

  const getCommentColor = (userId) => {
    const colors = [
      "#e3f2fd",
      "#fff3e0",
      "#e8f5e9",
      "#f3e5f5",
      "#e0f2f1",
      "#fff8e1",
    ];
    return colors[userId.charCodeAt(0) % colors.length];
  };

  const scrollToComment = (commentId) => {
    const commentElement = commentRefs.current[commentId];
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: "smooth" });
      commentElement.style.animation = "blink 1s 3";
    }
  };

  const renderComment = (comment) => (
    <Box
      key={comment.id}
      ref={(el) => (commentRefs.current[comment.id] = el)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems:
          comment.userId === currentUserUid ? "flex-end" : "flex-start",
        mt: 2,
        width: "100%",
        "@keyframes blink": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "#ffff80" },
          "100%": { backgroundColor: "transparent" },
        },
      }}
    >
      {comment.replyTo && (
        <Box
          onClick={() => scrollToComment(comment.replyTo.id)}
          sx={{
            mb: 1,
            p: 1,
            backgroundColor: "#f0f0f0",
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Replying to @{comment.replyTo.userName}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {comment.replyTo.text.length > 50
              ? `${comment.replyTo.text.substring(0, 50)}...`
              : comment.replyTo.text}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          flexDirection:
            comment.userId === currentUserUid ? "row-reverse" : "row",
          maxWidth: "80%",
        }}
      >
        <Avatar
          src={comment.userPhotoUrl}
          sx={{ width: 24, height: 24, mx: 1 }}
        >
          {comment.userName[0]}
        </Avatar>
        <Box
          id={comment.id}
          sx={{
            backgroundColor: getCommentColor(comment.userId),
            borderRadius: 2,
            p: 1,
            maxWidth: "100%",
            wordWrap: "break-word",
          }}
        >
          <Typography variant="body2" fontWeight="bold" sx={{ color: "#333" }}>
            {comment.userName}
          </Typography>
          <Typography variant="body2">{comment.text}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            {comment.userId !== currentUserUid && (
              <IconButton size="small" onClick={() => handleReply(comment)}>
                <ReplyIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={() => handleLike(comment)}>
              <Iconify
                icon={
                  comment.likes.includes(currentUserUid)
                    ? "flat-color-icons:like"
                    : "icon-park-twotone:like"
                }
                sx={{
                  width: 20,
                  height: 20,
                  mr: -1,
                  color: comment.likes.includes(currentUserUid)
                    ? undefined
                    : "inherit",
                }}
              />
            </IconButton>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {comment.likes.length} likes
            </Typography>
            {comment.userId === currentUserUid && (
              <IconButton size="small" onClick={() => handleDelete(comment.id)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Card sx={{ height: "100%", overflow: "auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <TextField
            label={
              replyingTo
                ? `Replying to ${replyingTo.userName}`
                : "Add a comment"
            }
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            {replyingTo && (
              <Button variant="outlined" onClick={() => setReplyingTo(null)}>
                Cancel Reply
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitComment}
            >
              Submit
            </Button>
          </Box>
        </Box>
        {comments.map((comment) => renderComment(comment))}
      </CardContent>
      <Dialog
        open={Boolean(deleteCommentId)}
        onClose={() => setDeleteCommentId(null)}
        sx={{
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0,0,30,0.4)",
        }}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentId(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CommentSection;
