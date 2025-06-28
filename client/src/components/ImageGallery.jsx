import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import PhotoEditor from "./PhotoEditor.jsx";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "./ImageUpload.jsx";
import TextToImage from "./TextToImage.jsx";
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Edit,
  Download,
  Delete,
  ArrowBack,
  CloudUpload,
  Brush,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext.jsx"; //poxac

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [imageBlobs, setImageBlobs] = useState({});
  const [showUploader, setShowUploader] = useState(false);
  const [uploaderTab, setUploaderTab] = useState(0); 
  const { user } = useAuth(); //poxac

  console.log(motion);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await api.get("/images");

        const blobs = {};
        for (const img of res.data) {
          const response = await api.get(`/images/${img._id}`, {
            responseType: "blob",
          });
          blobs[img._id] = URL.createObjectURL(response.data);
        }

        setImageBlobs(blobs);
        setImages(res.data);
      } catch (err) {
        console.log("Error loading images:", err);
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await api.delete(`/images/${id}`);

        setImages((prev) => prev.filter((img) => img._id !== id));
        setSuccessMessage("Image successfully deleted");

        // Update blob URLs
        const newBlobs = { ...imageBlobs };
        URL.revokeObjectURL(newBlobs[id]);
        delete newBlobs[id];
        setImageBlobs(newBlobs);
      } catch (err) {
        console.error("Error deleting image:", err);

        let errorMsg = "Failed to delete image";

        if (err.response) {
          if (err.response.status === 403) {
            errorMsg = "You do not have permission to delete this image";
          } else if (err.response.status === 404) {
            errorMsg = "Image not found";
          } else if (err.response.data?.message) {
            errorMsg = err.response.data.message;
          }
        }

        setError(errorMsg);
      }
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const response = await api.get(`/images/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading image:", err);
      setError("Failed to download image");
    }
  };

  const handleSaveEdited = async (dataUrl) => {
    try {
      const blob = await fetch(dataUrl).then((res) => res.blob());

      const formData = new FormData();
      formData.append("image", blob, `edited-${editingImage._id}.jpg`);

      await api.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await api.get("/images");
      setImages(res.data);
      setEditingImage(null);

      setSuccessMessage("Image successfully saved");
    } catch (err) {
      console.error("Error saving edited image:", err);
      setError("Failed to save changes to the image");
    }
  };

  // const handleAddGeneratedToCanvas = (url) => {
  //   fabric.Image.fromURL(url, (img) => {
  //     img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
  //     canvas.add(img);
  //     canvas.renderAll();
  //   });
  // };

  const handleSaveGenerated = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, `generated-${Date.now()}.png`);

      await api.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await api.get("/images");
      setImages(res.data);
      setShowUploader(false);
      setSuccessMessage("AI-generated image saved to gallery!");
    } catch (err) {
      console.error("Error saving generated image:", err);
      setError("Failed to save AI-generated image");
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren",
      },
    },
  };

  const closeEditor = () => {
    setEditingImage(null);
    setShowUploader(false);
  };

  {/*poxac stexic sksac*/}
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Please login to access your gallery
        </Typography>
        <Button variant="contained" href="/login" sx={{ mt: 2 }}>
          Go to Login Page
        </Button>
      </Box>
    );
  }
  {/*poxac minchev stex*/}
  return (
    <Box sx={{ p: 3 }}>
      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: "#2196F3" }}>
          YOUR GALLERY
        </Typography>
        
        {!editingImage && (
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setShowUploader(!showUploader)}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            }}
          >
            {showUploader ? "HIDE UPLOADER" : "UPLOAD IMAGE"}
          </Button>
        )}
      </Box> */}
      {/*poxac  stexic*/}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: "#2196F3" }}
          >
            YOUR GALLERY
          </Typography>
          
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {user && !editingImage && (
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setShowUploader(!showUploader)}
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              }}
            >
              {showUploader ? "HIDE UPLOADER" : "UPLOAD IMAGE"}
            </Button>
          )}
        </Box>
      </Box>
      {/*poxac minchev stex*/}

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {editingImage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={closeEditor}
            >
              BACK TO GALLERY
            </Button>
          </Box>

          <PhotoEditor
            imageUrl={`http://localhost:5000/api/images/${editingImage._id}`}
            onSave={handleSaveEdited}
          />
        </motion.div>
      ) : (
        <>
          {showUploader && (
            <Box
              sx={{
                mb: 4,
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Tabs
                value={uploaderTab}
                onChange={(e, newValue) => setUploaderTab(newValue)}
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab label="Upload Image" icon={<ImageIcon />} />
                <Tab label="Generate with AI" icon={<Brush />} />
              </Tabs>

              {uploaderTab === 0 ? (
                <ImageUpload
                  onUploadSuccess={() => {
                    setSuccessMessage("Image uploaded successfully!");
                    setShowUploader(false);
                  }}
                />
              ) : (
                <TextToImage
                  onImageReady={(url) => {
                    handleSaveGenerated(url);
                  }}
                />
              )}
            </Box>
          )}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 4,
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading images...
              </Typography>
            </Box>
          ) : images.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                bgcolor: "background.paper",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                You have not uploaded any images yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setShowUploader(true)}
                sx={{
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                }}
              >
                Upload your first image
              </Button>
            </Box>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={4.6}>
                <AnimatePresence>
                  {images.map((img) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={img._id}>
                      <motion.div variants={itemVariants} layout exit="exit">
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            transition: "transform 0.3s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                              boxShadow: 5,
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={imageBlobs[img._id]}
                            alt={img.filename}
                            sx={{
                              height: 200,
                              objectFit: "cover",
                            }}
                          />
                          <CardActions
                            sx={{
                              justifyContent: "center",
                              bgcolor: "background.default",
                              pt: 1,
                              pb: 1.5,
                            }}
                          >
                            <Tooltip title="edit">
                              <IconButton
                                onClick={() => setEditingImage(img)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="download">
                              <IconButton
                                onClick={() =>
                                  handleDownload(img._id, img.filename)
                                }
                                color="primary"
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="delete">
                              <IconButton
                                onClick={() => handleDelete(img._id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </motion.div>
          )}
        </>
      )}
    </Box>
  );
};

export default ImageGallery;
