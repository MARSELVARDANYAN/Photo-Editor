import React, { useState } from "react";
import api from "../services/api.js";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { styled } from "@mui/material/styles";
import CancelIcon from "@mui/icons-material/Cancel";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      setUploadStatus("error");
      setErrorMessage("Please select an image file");
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null); 
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadStatus("error");
      setErrorMessage("File not selected");
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await api.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("success");
      setFile(null); 
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setErrorMessage(
        err.response?.data?.message || "Error uploading file, please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        p: 3,
        m: 2,
        border: "1px dashed",
        borderColor: uploadStatus === "error" ? "error.main" : "#ccc",
        borderRadius: 2,
        maxWidth: 400,
        mx: "auto",
        bgcolor:
          uploadStatus === "success" ? "success.light" : "background.paper",
        transition: "all 0.3s ease",
      }}
    >
      <Button
        component="label"
        variant="outlined"
        color="primary"
        startIcon={<CloudUploadIcon />}
        disabled={isLoading}
        sx={{
          py: 1.5,
          px: 4,
          fontWeight: "bold",
          width: "100%",
        }}
      >
        {file ? file.name : "Choose an image"}
        <VisuallyHiddenInput
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>

      {file && (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            Selected file: {file.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(file.size / 1024).toFixed(2)} KB
          </Typography>
        </Box>
      )}

      {uploadStatus === "success" && (
        <Box
          sx={{ display: "flex", alignItems: "center", color: "success.main" }}
        >
          <CheckCircleIcon sx={{ mr: 1 }} />
          <Typography>Image uploaded!</Typography>
        </Box>
      )}

      {uploadStatus === "error" && (
        <Box
          sx={{ display: "flex", alignItems: "center", color: "error.main" }}
        >
          <ErrorIcon sx={{ mr: 1 }} />
          <Typography>{errorMessage}</Typography>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        color="success"
        disabled={!file || isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SendIcon />
          )
        }
        sx={{
          py: 1.5,
          px: 5,
          fontWeight: "bold",
          width: "100%",
          "&.Mui-disabled": {
            bgcolor: "action.disabledBackground",
            color: "text.disabled",
          },
        }}
      >
        {isLoading ? "loading..." : "load image"}
      </Button>
      <Button
        onClick={() => setFile(null)}
        variant="outlined"
        color="secondary"
        sx={{ width: "100%", py: 1.5, px: 4, fontWeight: "bold" }}
        disabled={isLoading || !file}
        startIcon={<CancelIcon />}
        style={{
          backgroundColor: "#f5f5f5",
          color: "#333",
          borderColor: "#ccc",
          transition: "background-color 0.3s, color 0.3s, border-color 0.3s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#ce4d4dff";
          e.currentTarget.style.color = "#000";
          e.currentTarget.style.borderColor = "#bbb";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
          e.currentTarget.style.color = "#333";
          e.currentTarget.style.borderColor = "#ccc";
        }}
      >
        cancel
      </Button>
    </Box>
  );
};

export default ImageUpload;
