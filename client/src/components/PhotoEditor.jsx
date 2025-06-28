import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric-browseronly";
import TextToImage from "./TextToImage";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Divider,
} from "@mui/material";
import {
  TextFields,
  Brush,
  Undo,
  Redo,
  Save,
  Crop,
  AspectRatio,
  FilterBAndW,
  FilterVintage,
  InvertColors,
  BlurOn,
  RestartAlt,
  Transform,
  ZoomIn,
  ZoomOut,
  FitScreen,
} from "@mui/icons-material";

const PhotoEditor = ({ imageUrl, onSave }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const originalImageRef = useRef(null);
  const originalDimensions = useRef({ width: 0, height: 0 });
  const [cropMode, setCropMode] = useState(false);
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [newWidth, setNewWidth] = useState(800);
  const [newHeight, setNewHeight] = useState(600);
  const [aspectRatio, setAspectRatio] = useState("free");
  const [zoomLevel, setZoomLevel] = useState(100);
  const cropRectRef = useRef(null);

  useEffect(() => {
    if (window.fabric) {
      setFabricLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
    script.async = true;
    script.onload = () => setFabricLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!fabricLoaded || !imageUrl) return;

    const initCanvas = async () => {
      const canvasObj = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#f0f0f0",
        preserveObjectStacking: true,
      });

      try {
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = "Anonymous";
          image.src = imageUrl + "?nocache=" + Date.now();

          image.onload = () => {
            originalDimensions.current = {
              width: image.naturalWidth,
              height: image.naturalHeight,
            };
            originalImageRef.current = image;
            resolve(image);
          };

          image.onerror = reject;
        });

        const fabricImg = new fabric.Image(img, {
          scaleX: canvasObj.width / img.width,
          scaleY: canvasObj.height / img.height,
        });

        canvasObj.setBackgroundImage(fabricImg, () => {
          canvasObj.renderAll();
          saveState(canvasObj);
        });

        setCanvas(canvasObj);
      } catch (error) {
        console.error("Error loading image:", error);
      }
    };

    initCanvas();

    return () => {
      if (canvas) canvas.dispose();
    };
  }, [imageUrl, fabricLoaded]);

  const saveState = (canvasObj) => {
    const newState = canvasObj.toJSON();
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex((prev) => prev + 1);
  };

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText("Ваш текст", {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: "#ffffff",
      fontFamily: "Arial",
      shadow: "rgba(0,0,0,0.5) 2px 2px 4px",
      objectCaching: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    saveState(canvas);
  };

  const applyFilter = (filterName) => {
    if (!canvas || !canvas.backgroundImage) return;

    const filters = {
      grayscale: new fabric.Image.filters.Grayscale(),
      sepia: new fabric.Image.filters.Sepia(),
      invert: new fabric.Image.filters.Invert(),
      blur: new fabric.Image.filters.Blur({ blur: 0.2 }),
      remove: null,
    };

    canvas.backgroundImage.filters = filters[filterName]
      ? [filters[filterName]]
      : [];

    canvas.backgroundImage.applyFilters();
    canvas.renderAll();
    saveState(canvas);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    loadState(history[newIndex]);
    setHistoryIndex(newIndex);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    loadState(history[newIndex]);
    setHistoryIndex(newIndex);
  };

  const loadState = (state) => {
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
    });
  };

  const enableCropMode = () => {
    if (!canvas) return;
    setCropMode(true);

    if (cropRectRef.current) {
      canvas.remove(cropRectRef.current);
    }

    const cropRect = new fabric.Rect({
      width: 300,
      height: 300,
      left: 250,
      top: 150,
      fill: "rgba(0,0,0,0.2)",
      stroke: "#2196f3",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      hasControls: true,
      lockRotation: true,
      transparentCorners: false,
    });

    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    cropRectRef.current = cropRect;

    cropRect.on("scaling", () => {
      if (aspectRatio !== "free") {
        const ratio = aspectRatio === "16:9" ? 16 / 9 : 4 / 3;
        cropRect.set({
          height: cropRect.width * ratio,
          scaleY: cropRect.scaleX,
        });
      }
    });
  };

  const applyCrop = () => {
    if (!canvas || !cropRectRef.current) return;

    const cropRect = cropRectRef.current;
    const bgImg = canvas.backgroundImage;

    const scaleX = bgImg.scaleX;
    const scaleY = bgImg.scaleY;
    // const imgWidth = bgImg.width * scaleX;
    // const imgHeight = bgImg.height * scaleY;

    const left = (cropRect.left - bgImg.left) / scaleX;
    const top = (cropRect.top - bgImg.top) / scaleY;
    const width = cropRect.width / scaleX;
    const height = cropRect.height / scaleY;

    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    tempCanvas.width = width;
    tempCanvas.height = height;

    ctx.drawImage(
      originalImageRef.current,
      left,
      top,
      width,
      height,
      0,
      0,
      width,
      height
    );

    const croppedImg = new Image();
    croppedImg.src = tempCanvas.toDataURL("image/png");

    croppedImg.onload = () => {
      const newImg = new fabric.Image(croppedImg, {
        scaleX: canvas.width / croppedImg.width,
        scaleY: canvas.height / croppedImg.height,
      });

      canvas.setBackgroundImage(newImg, () => {
        canvas.renderAll();
        saveState(canvas);
      });

      originalImageRef.current = croppedImg;
      originalDimensions.current = {
        width: croppedImg.width,
        height: croppedImg.height,
      };

      canvas.remove(cropRect);
      setCropMode(false);
      cropRectRef.current = null;
    };
  };

  const cancelCrop = () => {
    if (!canvas || !cropRectRef.current) return;
    canvas.remove(cropRectRef.current);
    setCropMode(false);
    cropRectRef.current = null;
  };

  const handleResize = () => {
    if (!canvas) return;

    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);

    const bgImg = canvas.backgroundImage;
    if (bgImg) {
      bgImg.scaleX = newWidth / (bgImg.width * bgImg.scaleX);
      bgImg.scaleY = newHeight / (bgImg.height * bgImg.scaleY);
      canvas.renderAll();
      saveState(canvas);
    }

    setResizeDialogOpen(false);
  };

  const handleZoom = (value) => {
    if (!canvas) return;

    const zoomFactor = value / 100;
    canvas.setZoom(zoomFactor);
    setZoomLevel(value);
  };

  const fitToScreen = () => {
    if (!canvas) return;

    const container = canvasRef.current.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / canvas.getWidth();
    const scaleY = containerHeight / canvas.getHeight();
    const scale = Math.min(scaleX, scaleY);

    canvas.setZoom(scale);
    setZoomLevel(Math.round(scale * 100));
  };

  const handleSave = async () => {
    if (!canvas || !originalImageRef.current) return;

    const tempCanvas = new fabric.StaticCanvas(null, {
      width: originalDimensions.current.width,
      height: originalDimensions.current.height,
    });

    const bgImg = new fabric.Image(originalImageRef.current, {
      scaleX: 1,
      scaleY: 1,
    });

    if (canvas.backgroundImage.filters.length > 0) {
      bgImg.filters = [...canvas.backgroundImage.filters];
      bgImg.applyFilters();
    }

    tempCanvas.setBackgroundImage(bgImg, () => {
      const scaleX = originalDimensions.current.width / canvas.width;
      const scaleY = originalDimensions.current.height / canvas.height;

      const cloneObjects = async () => {
        const objects = canvas.getObjects();
        const clonedObjects = [];

        for (const obj of objects) {
          const clonedObj = await new Promise((resolve) => obj.clone(resolve));

          clonedObj.set({
            left: obj.left * scaleX,
            top: obj.top * scaleY,
            scaleX: obj.scaleX * scaleX,
            scaleY: obj.scaleY * scaleY,
          });

          if (obj.type === "i-text") {
            clonedObj.set({
              fontSize: obj.fontSize * scaleX,
            });
          }

          clonedObjects.push(clonedObj);
        }
        return clonedObjects;
      };

      cloneObjects().then((clonedObjects) => {
        tempCanvas.add(...clonedObjects);
        tempCanvas.renderAll();

        const dataUrl = tempCanvas.toDataURL({
          format: "png",
          multiplier: 1,
          quality: 1.0,
        });

        onSave(dataUrl);
        tempCanvas.dispose();
      });
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Toolbar */}
      
      <Paper
        elevation={3}
        sx={{
          p: 1,
          mb: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {/* filters */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Black & White">
            <IconButton
              onClick={() => applyFilter("grayscale")}
              color="primary"
            >
              <FilterBAndW />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sepia">
            <IconButton onClick={() => applyFilter("sepia")} color="primary">
              <FilterVintage />
            </IconButton>
          </Tooltip>
          <Tooltip title="Invert Colors">
            <IconButton onClick={() => applyFilter("invert")} color="primary">
              <InvertColors />
            </IconButton>
          </Tooltip>
          <Tooltip title="Blur">
            <IconButton onClick={() => applyFilter("blur")} color="primary">
              <BlurOn />
            </IconButton>
          </Tooltip>
          <Tooltip title="original">
            <IconButton onClick={() => applyFilter("remove")} color="primary">
              <RestartAlt />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* utils */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="add text">
            <IconButton onClick={addText} color="primary">
              <TextFields />
            </IconButton>
          </Tooltip>
          <Tooltip title="crop">
            <IconButton
              onClick={enableCropMode}
              color={cropMode ? "secondary" : "primary"}
            >
              <Crop />
            </IconButton>
          </Tooltip>
          <Tooltip title="resize">
            <IconButton
              onClick={() => setResizeDialogOpen(true)}
              color="primary"
            >
              <Transform />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* history */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Undo">
            <IconButton
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              color="primary"
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              color="primary"
            >
              <Redo />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* zoom */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 200 }}>
          <Tooltip title="Decrease Zoom">
            <IconButton
              onClick={() => handleZoom(Math.max(zoomLevel - 10, 10))}
              color="primary"
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Slider
            value={zoomLevel}
            onChange={(e, value) => handleZoom(value)}
            min={10}
            max={200}
            sx={{ width: 100 }}
          />
          <Tooltip title="Increase Zoom">
            <IconButton
              onClick={() => handleZoom(Math.min(zoomLevel + 10, 200))}
              color="primary"
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to Screen">
            <IconButton onClick={fitToScreen} color="primary">
              <FitScreen />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* save */}
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{
            ml: "auto",
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          }}
        >
          Save
        </Button>
      </Paper>

      {/* spare area */}
      <Box
        sx={{
          p: 2,
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          border: "5px solid #e0e0e0",
          borderRadius: 1,
          backgroundColor: "#0d0d0d",
          height: "80vh",
          minHeight: 600,
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}
      </Box>

      {/* crop */}
      {cropMode && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Crop mode</Typography>

          <ToggleButtonGroup
            value={aspectRatio}
            exclusive
            onChange={(e, newRatio) => setAspectRatio(newRatio)}
            sx={{ mx: 2 }}
          >
            <ToggleButton value="free" title="Free">
              <AspectRatio />
              <Box sx={{ ml: 1 }}>Free</Box>
            </ToggleButton>
            <ToggleButton value="4:3" title="4:3">
              <AspectRatio />
              <Box sx={{ ml: 1 }}>4:3</Box>
            </ToggleButton>
            <ToggleButton value="16:9" title="16:9">
              <AspectRatio />
              <Box sx={{ ml: 1 }}>16:9</Box>
            </ToggleButton>
          </ToggleButtonGroup>

          <Box>
            <Button
              variant="outlined"
              color="error"
              onClick={cancelCrop}
              sx={{ mr: 2 }}
            >
              cancel
            </Button>
            <Button variant="contained" color="success" onClick={applyCrop}>
              Apply crop
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog
        open={resizeDialogOpen}
        onClose={() => setResizeDialogOpen(false)}
      >
        <DialogTitle>Changing the Canvas Size</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Width (px)"
                type="number"
                value={newWidth}
                onChange={(e) => setNewWidth(parseInt(e.target.value) || 0)}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (px)"
                type="number"
                value={newHeight}
                onChange={(e) => setNewHeight(parseInt(e.target.value) || 0)}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResizeDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResize} color="primary" variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhotoEditor;
