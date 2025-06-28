import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Slide,
  useScrollTrigger,
  Avatar,
} from "@mui/material";
import Logout from "./Logout";
import { styled } from "@mui/material/styles";
import PaletteIcon from "@mui/icons-material/Palette";
import { keyframes } from "@emotion/react";
import { useAuth } from "../context/AuthContext"; //poxac

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AnimatedHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  height: "70px",
  padding: theme.spacing(0, 4),
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: theme.zIndex.appBar,
  boxShadow: theme.shadows[6],
  background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
  backgroundSize: "200% 200%",
  animation: `${gradientAnimation} 8s ease infinite`,
  transition: "all 0.4s ease",
  "&:hover": {
    boxShadow: theme.shadows[10],
    height: "75px",
  },
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(to right, #ffffff, #e0f7fa)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textShadow: "0 0 10px rgba(33, 150, 243, 0.7)",
  fontWeight: 700,
  letterSpacing: "0.1em",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.8rem",
  },
}));

const Header = () => {
  const trigger = useScrollTrigger();
  const { user } = useAuth(); //poxac

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AnimatedHeader>
          <GlowingText variant="h2">
            <PaletteIcon
              fontSize="large"
              sx={{
                color: "white",
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
              }}
            />
            PHOTO EDITOR
          </GlowingText>

          {/* <Box sx={{ 
            display: "flex", 
            alignItems: "center",
            padding: 6,
            gap: 2
          }}>
            <Typography variant="subtitle1" sx={{ 
              color: "rgba(255,255,255,0.9)", 
              fontWeight: 500,
              letterSpacing: "0.05em",
              display: { xs: "none", sm: "block" }
            }}>
                Welcome to the Photo Editor
            </Typography>
            <Logout />
          </Box> */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: 6,
              gap: 2,
            }}
          >
            {user && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                  }}
                >
                  Welcome, {user.username}
                </Typography>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                />
              </>
            )}
            <Logout />
          </Box>
        </AnimatedHeader>
      </Slide>

      <Box sx={{ height: "70px" }} />
    </>
  );
};

export default Header;
