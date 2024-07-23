import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { Portal } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
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
  setDoc,
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
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import { QRCodeSVG } from "qrcode.react";
import CommentSection from "../CommentSection";
import BreadcrumbsNavigation from "../BreadcrumbsNavigation";

export default function BlogView() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [openNewPost, setOpenNewPost] = useState(false);

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

  useEffect(() => {
    if (shareButtonRef.current) {
      setAnchorEl(shareButtonRef.current);
    }
  }, []);
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
      // console.log("Setting anchorEl", shareButtonRef.current);
      // setAnchorEl(shareButtonRef.current);
      setIsPopoverOpen(true);
    } catch (error) {
      console.error("Error updating share count:", error);
    }
  };

  const handleShareClose = () => {
    setIsPopoverOpen(false);
  };
  const shareUrl = `${window.location.origin}/dashboard/blog?blogId=${blogId}`;

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
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const blogIdFromUrl = urlParams.get("blogId");
    const searchParam = urlParams.get("search");

    if (blogIdFromUrl) {
      handleCardClick({ id: blogIdFromUrl });
    }
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
    }

    // fetchPosts();
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
  const handleCardClick = async (blog) => {
    setLoading(true);
    try {
      const blogDoc = await getDoc(doc(db, "blogs", blog.id));
      if (blogDoc.exists()) {
        setSelectedBlog({ id: blogDoc.id, ...blogDoc.data() });
        setBreadcrumbs(["Dashboard", "Blog", blogDoc.data().title]);
        navigate(`/dashboard/blog?blogId=${blog.id}`, { replace: true });
        incrementViewCount(blog.id);
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
        return [...posts].sort(
          (a, b) => b.blogPostDate.seconds - a.blogPostDate.seconds
        );
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

  //save new post
  const handleNewPost = async () => {
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
      });
      console.log("Document written with ID: ", docRef.id);
      setOpenNewPost(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  const displayedPosts = filterPosts(sortPosts(posts, sortOption), searchTerm);
  return (
    <Container>
      <Card sx={{ p: 4, mt: 3 }}>
        <BreadcrumbsNavigation
          breadcrumbs={breadcrumbs}
          handleBreadcrumbClick={handleBreadcrumbClick}
        />

        {selectedBlog ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h4">{selectedBlog.title}</Typography>
              <Button
                ref={shareButtonRef}
                startIcon={<ShareIcon />}
                onClick={handleShare}
                variant="contained"
              >
                Share
              </Button>
            </Box>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography
                variant="body1"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />
            </Card>
            <Box sx={{ mt: 4 }}>
              <CommentSection blogId={selectedBlog.id} currentUser={userData} />
            </Box>
          </Box>
        ) : (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={5}
            >
              <Typography variant="h4">Blog</Typography>

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
            <Portal>
              <Popover
                id={shareId}
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={handleShareClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
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
                  <QRCodeSVG
                    id="QRCode"
                    value={shareUrl}
                    size={128}
                    level="M"
                  />
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
            </Portal>
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
