// src/components/Auth.jsx
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Fade,
  Slide,
  Divider,
  InputAdornment,
  IconButton,
  useTheme,
  styled,
} from "@mui/material";
import {
  LockOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
  PaletteOutlined,
  LoginOutlined,
  HowToRegOutlined,
  Google,
  Facebook,
} from "@mui/icons-material";
import { keyframes } from "@emotion/react";

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage:
    "url(https://images.unsplash.com/photo-1504198453319-5ce911bafcde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(106,17,203,0.85) 0%, rgba(37,117,252,0.85) 100%)",
    zIndex: 1,
  },
}));

const AuthForm = styled(Paper)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  width: "100%",
  maxWidth: 450,
  boxShadow: theme.shadows[10],
  background: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(10px)",
  transform: "translateY(0)",
  transition: "transform 0.4s, box-shadow 0.4s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[16],
  },
}));

const AnimatedHeader = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textFillColor: "transparent",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: theme.spacing(4),
  position: "relative",
  paddingBottom: theme.spacing(2),
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "80px",
    height: "4px",
    background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
    borderRadius: "2px",
  },
}));

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { register, login, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      // Перенаправление на предыдущую страницу или на главную
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  const handleToggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setError("");
      setIsAnimating(false);
    }, 300);
  };

  const handleSocialLogin = (provider) => {
    // Сохраняем текущее местоположение для возврата после авторизации
    const returnTo = location.pathname + location.search;
    provider(returnTo);
  };

  return (
    <AuthContainer>
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <AuthForm elevation={6}>
          <Box textAlign="center" mb={3}>
            <PaletteOutlined
              fontSize="large"
              sx={{
                color: theme.palette.primary.main,
                fontSize: "3rem",
                mb: 1,
              }}
            />
            <AnimatedHeader variant="h2">PHOTO EDITOR</AnimatedHeader>
          </Box>

          <Typography
            variant="h5"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {isLogin ? "Sign in" : "Create an account"}
          </Typography>

          {error && (
            <Fade in={!!error}>
              <Typography
                color="error"
                textAlign="center"
                mb={2}
                sx={{
                  backgroundColor: theme.palette.error.light,
                  padding: theme.spacing(1),
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                {error}
              </Typography>
            </Fade>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: theme.shape.borderRadius * 2,
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="password"
              variant="outlined"
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: theme.shape.borderRadius * 2,
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                  },
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={isLogin ? <LoginOutlined /> : <HowToRegOutlined />}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: theme.shape.borderRadius * 2,
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #5d0fb9 0%, #1c6ae0 100%)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {isLogin ? "sign in" : "sign up"}
            </Button>

            <Divider sx={{ my: 2 }}>or</Divider>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleSocialLogin(loginWithGoogle)}
              startIcon={<Google />}
              sx={{
                mb: 2,
                bgcolor: "#DB4437",
                "&:hover": { bgcolor: "#c53929" },
              }}
            >
              Sign in with Google
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={() => handleSocialLogin(loginWithFacebook)}
              startIcon={<Facebook />}
              sx={{
                bgcolor: "#4267B2",
                "&:hover": { bgcolor: "#365899" },
                mb: 2,
              }}
            >
              Sign in with Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleToggleMode}
              sx={{
                py: 1.5,
                borderRadius: theme.shape.borderRadius * 2,
                fontWeight: 500,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  backgroundColor: theme.palette.primary.light + "22",
                },
              }}
            >
              {isLogin
                ? "No account? Register here:"
                : "Already have an account? Login:"}
            </Button>
          </form>
        </AuthForm>
      </Slide>
    </AuthContainer>
  );
};

export default Auth;
