// import { Router } from "express";
// import {auth} from "../middleware/auth.js";
// import {
//   register,
//   login,
//   validateToken,
//   getCurrentUser,
  
// } from "../controllers/auth.js";
// const router = Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/validate", auth, validateToken);
// router.get("/me", auth, getCurrentUser);

// export default router;


import { Router } from "express";
import passport from "passport";
import { auth } from "../middleware/auth.js";
import {
  register,
  login,
  validateToken,
  getCurrentUser,
  logout
} from "../controllers/auth.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", auth, logout);

router.get("/google", (req, res, next) => {
  const state = req.query.redirect || '/';
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    accessType: "offline",
    state: state 
  })(req, res, next);
});


router.get("/google/callback", 
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    const state = req.query.state ? decodeURIComponent(req.query.state) : '/';
    res.redirect(`${process.env.CLIENT_URL}/oauth-redirect?token=${encodeURIComponent(token)}&state=${encodeURIComponent(state)}`);
  }
);



router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", 
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
  res.redirect(`${process.env.CLIENT_URL}/oauth-redirect?token=${encodeURIComponent(token)}`);
  }
);

router.get("/validate", auth, validateToken);
router.get("/me", auth, getCurrentUser);

const generateToken = (user) => {
  return jwt.sign(
    { user: { id: user.id } },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export default router;