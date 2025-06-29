import React, { useState } from "react";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

const TextToImage = ({ onImageReady }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post(
        "/generate",
        { prompt },
        {
          params: { _t: Date.now() },
        }
      );
      onImageReady(res.data.imageUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 600,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        🖌️ Image generation by text:
      </Typography>

      <TextField
        label="Enter description (prompt)"
        variant="outlined"
        fullWidth
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A dragon flying over the mountains..."
      />

      {errorMsg && (
        <Typography color="error" variant="body2">
          {errorMsg}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={loading}
        size="large"
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Generate Image"
        )}
      </Button>
    </Box>
  );
};

export default TextToImage;
