import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import UserProfileSection from "../UserProfileSection";
import { useUser } from "../../../hooks/UserContext";

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebase";

import Iconify from "../../../components/iconify";
import PostCard from "../post-card";
import PostSort from "../post-sort";
import PostSearch from "../post-search";
import NewPostForm from "../NewPostForm";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { QRCodeSVG } from "qrcode.react";
import CommentSection from "../CommentSection";
import BreadcrumbsNavigation from "../BreadcrumbsNavigation";

export default function BlogView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openNewPost, setOpenNewPost] = useState(false);
  const [blogId, setBlogId] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(["Dashboard", "Blog"]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const shareButtonRef = useRef(null);
  const open = Boolean(anchorEl);
  const shareId = open ? "share-popover" : undefined;
  const { userData } = useUser();
  const [posts, setPosts] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogPosterData, setBlogPosterData] = useState(null);

  const handleShare = async () => {
    const userId = userData.uid;
    const blogRef = doc(db, "blogs", selectedBlog.id);

    try {
      const blogDoc = await getDoc(blogRef);
      if (blogDoc.exists()) {
        const blogData = blogDoc.data();
        const sharedUsers = blogData.sharedUsers || [];

        if (!sharedUsers.includes(userId)) {
          await updateDoc(blogRef, {
            sharedUsers: arrayUnion(userId),
            shareCount: increment(1),
          });
        }
      }
      setAnchorEl(shareButtonRef.current);
      setIsPopoverOpen(true);
    } catch (error) {
      console.error("Error updating share count:", error);
    }
  };

  const handleShareClose = () => {
    setIsPopoverOpen(false);
  };
  const shareUrl = selectedBlog
    ? `${window.location.origin}/dashboard/blog?blogId=${selectedBlog.id}`
    : "";

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=Check out this blog post&body=I thought you might be interested in this blog post: ${shareUrl}`;
    handleShareClose();
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=Check out this blog post: ${shareUrl}`);
    handleShareClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    handleShareClose();
    // You might want to show a toast or some feedback here
  };

  const handleQrCodeDownload = () => {
    const svg = document.getElementById("QRCode");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Blog_post_QRCode";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log("No such user!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };
  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;

      setLoading(true);
      try {
        const blogDoc = await getDoc(doc(db, "blogs", blogId));
        if (blogDoc.exists()) {
          const blogData = { id: blogDoc.id, ...blogDoc.data() };
          setSelectedBlog(blogData);
          setBreadcrumbs(["Dashboard", "Blog", blogData.title]);
          incrementViewCount(blogId);

          // Fetch user data
          if (blogData.blogPosterUid) {
            const userData = await fetchUserData(blogData.blogPosterUid);
            setBlogPosterData(userData);
          }
        } else {
          console.log("No such document!");
          // Show error toast
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        // Show error toast
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const blogIdFromUrl = urlParams.get("blogId");
    const searchParam = urlParams.get("search");

    if (blogIdFromUrl) {
      setBlogId(blogIdFromUrl);
    }
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
    }
  }, [location]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blogs"), orderBy("blogPostDate", "desc"));
      const querySnapshot = await getDocs(q);
      let fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        viewedUsers: doc.data().viewedUsers || [],
        sharedUsers: doc.data().sharedUsers || [],
      }));

      // Apply search filter if searchTerm exists
      if (searchTerm) {
        fetchedPosts = filterPosts(fetchedPosts, searchTerm);
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [location]);

  const handleCardClick = (blog) => {
    setBlogId(blog.id);
    navigate(`/dashboard/blog?blogId=${blog.id}`, { replace: true });
  };

  const incrementViewCount = async (blogId) => {
    if (!userData || !userData.uid) {
      console.error("User data is not available");
      return;
    }

    const userId = userData.uid;
    const blogRef = doc(db, "blogs", blogId);

    try {
      const blogDoc = await getDoc(blogRef);
      if (blogDoc.exists()) {
        const blogData = blogDoc.data();
        const viewedUsers = blogData.viewedUsers || [];

        if (!viewedUsers.includes(userId)) {
          await updateDoc(blogRef, {
            viewedUsers: arrayUnion(userId),
            viewCount: increment(1),
          });
        }
      }
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };
  const handleBreadcrumbClick = (event, index) => {
    event.preventDefault();
    if (index === 0) {
      navigate("/dashboard");
    } else if (index === 1) {
      setBreadcrumbs(["Dashboard", "Blog"]);
      setSelectedBlog(null);
      navigate(
        `/dashboard/blog${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`,
        { replace: true }
      );
    }
  };
  const sortPosts = (posts, option) => {
    switch (option) {
      case "latest":
        return [...posts].sort((a, b) => {
          const dateA =
            a.blogPostDate instanceof Date
              ? a.blogPostDate
              : a.blogPostDate.toDate();
          const dateB =
            b.blogPostDate instanceof Date
              ? b.blogPostDate
              : b.blogPostDate.toDate();

          return dateB - dateA;
        });

      case "popular":
        return [...posts].sort((a, b) => b.viewCount - a.viewCount);
      case "oldest":
        return [...posts].sort(
          (a, b) => a.blogPostDate.seconds - b.blogPostDate.seconds
        );
      default:
        return posts;
    }
  };

  const filterPosts = (posts, searchTerm) => {
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const handleSort = (event) => {
    setSortOption(event.target.value);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSelectedBlog(null);
    navigate(`/dashboard/blog?search=${encodeURIComponent(term)}`, {
      replace: true,
    });
  };

  // delete blog
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "blogs", selectedBlog.id));
      setSelectedBlog(null);
      fetchPosts();
      navigate("/dashboard/blog", { replace: true });
      // You might want to show a success message here
    } catch (error) {
      console.error("Error deleting blog:", error);
      // You might want to show an error message here
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const displayedPosts = filterPosts(sortPosts(posts, sortOption), searchTerm);
  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Blog
      </Typography>
      <Card sx={{ p: 4, mt: 3 }}>
        <BreadcrumbsNavigation
          breadcrumbs={breadcrumbs}
          handleBreadcrumbClick={handleBreadcrumbClick}
        />

        {selectedBlog ? (
          <Box sx={{ backgroundColor: "#f5f5f5", borderRadius: 2, p: 3 }}>
            <Typography
              variant="h4"
              sx={{ mb: 3, color: "#1a237e", fontWeight: "bold" }}
            >
              {selectedBlog.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              {blogPosterData && (
                <UserProfileSection
                  user={{
                    BlogPosterUid: selectedBlog.blogPosterUid,
                    displayName:
                      blogPosterData.name || selectedBlog.blogPosterName,
                    role:
                      blogPosterData.userrole || selectedBlog.blogPosterRole,
                    photoURL: blogPosterData.photoURL,
                    email: blogPosterData.email,
                  }}
                />
              )}
              <Box>
                <Button
                  ref={shareButtonRef}
                  onClick={handleShare}
                  variant="outlined"
                  sx={{ borderColor: "#0A4191", mr: 2 }}
                >
                  <Iconify
                    icon="tabler:share-3"
                    sx={{ color: "#FFD700", width: 20, height: 20 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      ml: 0.5,
                      fontSize: 15,
                      color: "#0A4191",
                    }}
                  >
                    Share
                  </Typography>
                </Button>
                {selectedBlog.blogPosterUid === userData.uid && (
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteClick}
                    variant="contained"
                    color="error"
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Card
              sx={{ p: 4, mb: 4, boxShadow: 3, backgroundColor: "#ffffff" }}
            >
              <Typography
                variant="body1"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                sx={{ lineHeight: 1.8, color: "#333333" }}
              />
            </Card>

            <Box
              sx={{
                mt: 4,
                backgroundColor: "#ffffff",
                p: 3,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "#1a237e" }}>
                Comments
              </Typography>
              <CommentSection blogId={selectedBlog.id} currentUser={userData} />
            </Box>
            {/* share popover  */}
            <Popover
              id={shareId}
              open={isPopoverOpen}
              anchorEl={anchorEl}
              onClose={handleShareClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <List>
                <ListItem button onClick={handleEmailShare}>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="Email" />
                </ListItem>
                <ListItem button onClick={handleWhatsAppShare}>
                  <ListItemIcon>
                    <WhatsAppIcon />
                  </ListItemIcon>
                  <ListItemText primary="WhatsApp" />
                </ListItem>
                <ListItem button onClick={handleCopyLink}>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText primary="Copy Link" />
                </ListItem>
              </List>
              <Box
                sx={{
                  p: 2,
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  QR Code
                </Typography>
                <QRCodeSVG id="QRCode" value={shareUrl} size={128} level="M" />
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleQrCodeDownload}
                  sx={{
                    mt: 1,
                    backgroundColor: "#0A4191",
                    color: "#ffff",
                    p: 1,
                  }}
                >
                  Download QR Code
                </Button>
              </Box>
            </Popover>

            {/* delete dialog  */}
            <Dialog
              open={deleteDialogOpen}
              onClose={handleDeleteCancel}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Confirm Delete"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to delete this blog post? This action
                  cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel}>Cancel</Button>
                <Button onClick={handleDeleteConfirm} autoFocus color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        ) : (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={5}
            >
              <Typography variant="h4">Blogs</Typography>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => setOpenNewPost(true)}
              >
                New Post
              </Button>
            </Stack>
            <Stack
              mb={5}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <PostSearch posts={posts} onSearch={handleSearch} />
              <PostSort
                options={[
                  { value: "latest", label: "Latest" },
                  { value: "popular", label: "Popular" },
                  { value: "oldest", label: "Oldest" },
                ]}
                onSort={handleSort}
                currentSort={sortOption}
              />
            </Stack>
            <Grid container spacing={3}>
              {displayedPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  onCardClick={handleCardClick}
                />
              ))}
            </Grid>
            {/* New Post Dialog */}
            {openNewPost && (
              <NewPostForm
                open={openNewPost}
                onClose={() => {
                  setOpenNewPost(false);
                  fetchPosts();
                }}
              />
            )}

            {/* //new post dialog  */}
            <Dialog
              open={openNewPost}
              onClose={() => setOpenNewPost(false)}
              fullWidth
              maxWidth="md"
            >
              <DialogTitle>New Post</DialogTitle>
              <DialogContent>
                <NewPostForm
                  onClose={() => {
                    setOpenNewPost(false);
                    fetchPosts();
                  }}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </Card>
    </Container>
  );
}
