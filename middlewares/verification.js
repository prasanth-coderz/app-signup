const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};


// isAdmin middleware
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  // Verify and decode the token to extract user information
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Check if the user has the 'admin' role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: User is not an admin'  });
    }
    
    // User is an admin, proceed to the next middleware or route handler
    // next();
  });
};

module.exports = { verifyToken, isAdmin };
