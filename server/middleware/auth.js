// // server/middleware/auth.js
// import jwt from 'jsonwebtoken';

// export const auth = (req, res, next) => {
//   const authHeader = req.header('x-auth-token');
  
//   if (!authHeader) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   const tokenParts = authHeader.split(' ');
//   const token = tokenParts.length === 2 ? tokenParts[1] : authHeader;

//   if (!token) {
//     return res.status(401).json({ message: 'Invalid token format' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     const now = Math.floor(Date.now() / 1000);
//     if (decoded.exp - now < 3600) { 
//       const newToken = jwt.sign(
//         { user: { id: decoded.user.id } }, 
//         process.env.JWT_SECRET, 
//         { expiresIn: '24h' }
//       );
//       res.setHeader('x-refreshed-token', newToken);
//     }
    
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     console.error('Token verification error:', err);
    
//     let message = 'Token is not valid';
//     if (err.name === 'TokenExpiredError') {
//       message = 'Token expired';
//     } else if (err.name === 'JsonWebTokenError') {
//       message = 'Invalid token';
//     }
    
//     res.status(401).json({ message });
//   }
// };

import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const authHeader = req.header('x-auth-token');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.startsWith('Bearer ') ? 
    authHeader.split(' ')[1] : 
    authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 3600) {
      const newToken = jwt.sign(
        { user: { id: decoded.user.id } }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
      );
      res.setHeader('x-refreshed-token', newToken);
    }
    
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    
    let message = 'Token is not valid';
    if (err.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }
    
    res.status(401).json({ message });
  }
};