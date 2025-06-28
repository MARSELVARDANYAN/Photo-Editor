import React from 'react';
import { Box, Typography } from '@mui/material';



const Footer = () => (
  <Box 
    component="footer" 
    sx={{ 
      py: 3, 
      px: 2, 
      mt: "auto", 
      backgroundColor: "primary.main",
      color: "white",
      textAlign: "center",
    }}
  >
    <Typography variant="body2">
      © {new Date().getFullYear()} Photo Editor App. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;