const jwt = require("jsonwebtoken");
function decodeToken(token) {
  try {
    if (token && token.length > 0) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      return { success: true, decodedToken };
    }
    return { success: false, error: { message: "Invalid Token" } };
  } catch (error) {
    return { success: false, error };
  }
}

function getToken(user) {
  try {
    const token = jwt.sign(
      {
        user,
      },

      process.env.JWT_SECRET,
      {
        expiresIn: Number(process.env.JWT_EXPIRES_IN), //10 days
      }
    );

    return { success: true, token };
  } catch (error) {
    return { success: false, error };
  }
}

module.exports = {
  decodeToken,
  getToken,
};
