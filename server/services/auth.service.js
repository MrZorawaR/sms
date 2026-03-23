const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  generateTokens(user) {
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async login(username, password) {
    const user = await User.findOne({ username }).populate("profile");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Invalid refresh token");
    }

    const user = await User.findById(decoded.id).populate("profile");
    if (!user || !user.isActive) {
      throw new Error("Invalid or inactive user");
    }

    return this.generateTokens(user);
  }
}

module.exports = new AuthService();
