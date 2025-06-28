import React from "react";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import ImageGallery from "./ImageGallery";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flex: 1, 
          py: 4, 
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: 1400,
          mx: "auto",
          width: "100%",
        }}
      >
        <ImageGallery />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;