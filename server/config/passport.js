import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function initializePassport() {
  console.log("Initializing Passport with:");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("FACEBOOK_APP_ID:", process.env.FACEBOOK_APP_ID);

  const generateToken = (user) => {
    return jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  };

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Initializing Google Strategy");
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            "https://photo-editor-1.onrender.com/api/auth/google/callback", // Явный URL
          scope: ["profile", "email"],
          proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
              user = new User({
                googleId: profile.id,
                email: profile.emails[0]?.value || `${profile.id}@google.com`,
                username: profile.displayName || `google_${profile.id}`,
                provider: "google",
                avatar: profile.photos[0]?.value,
              });
              await user.save();
            }

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  } else {
    console.warn(
      "Google OAuth credentials not set. Google login will be disabled."
    );
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    console.log("Initializing Facebook Strategy");
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          proxy: true,
          profileFields: ["id", "emails", "name", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ facebookId: profile.id });

            if (!user) {
              user = new User({
                facebookId: profile.id,
                email: profile.emails[0]?.value || `${profile.id}@facebook.com`,
                username: profile.displayName || `facebook_${profile.id}`,
                provider: "facebook",
                avatar: profile.photos[0]?.value,
              });
              await user.save();
            }

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  } else {
    console.warn(
      "Facebook OAuth credentials not set. Facebook login will be disabled."
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  return passport;
}
