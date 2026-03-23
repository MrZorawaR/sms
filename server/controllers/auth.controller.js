const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(username, password);

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message.includes("Invalid credentials") || error.message.includes("deactivated")) {
        return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const tokens = await authService.refresh(req.cookies.refreshToken);

    // Set new cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, message: "Tokens refreshed" });
  } catch (error) {
    console.error("Refresh error:", error);
    if (error.message.includes("refresh token") || error.message.includes("user")) {
        return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role,
        profile: req.user.profile,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  refresh,
  logout,
  getCurrentUser,
};
