const jwt = require('jsonwebtoken');
require('dotenv').config();
// Middleware function to verify JWT
const verifyToken = (req, res, next) => {
  // Get the token from the request header
  const token = req.headers.authorization; // Typically, the token is passed as "Bearer <token>"
  //console.log("the token is "+token);
  if (!token) {
    
    return res.status(401).json({ message: 'Access Denied. No Token Provided!' });
  }


  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Ensure the `timestamp` field exists
  //  console.log(decoded.timestamp);
    if (!decoded.timestamp) {
      return res
        .status(401)
        .json({ message: "Invalid token: timestamp missing!" });
    }

    // Validate the `timestamp` field
    if (Date.now() >= decoded.timestamp + 14400000) {
      // Add 1 hour (3600000 ms)
      return res.status(401).json({ message: "Token has expired!" });
    }

    // Attach the decoded payload to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token!" });
  }
};

module.exports = verifyToken;