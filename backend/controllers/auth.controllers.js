import genToken from "../config/token.js";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { formatUser } from "../utils/formatUser.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const signUp = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    email = email.trim().toLowerCase();

    const existEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existEmail) {
      return res.status(400).json({ message: "email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const token = await genToken(newUser.id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production"
    });

    // Exclude password from return payload
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(200).json(formatUser(userWithoutPassword));

  } catch (error) {
    return res.status(500).json({ message: `internal server error: ${error.message}` });
  }
};

export const Login = async (req, res) => {
  try {
    console.log("Full req.body:", req.body);
    let { email, password } = req.body;

    email = email.trim().toLowerCase();
    console.log("Email after trim:", email);

    const foundUser = await prisma.user.findUnique({
      where: { email }
    });
    console.log("User found:", foundUser);
    if (!foundUser) {
      return res.status(400).json({ message: "email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "incorrect password" });
    }

    const token = await genToken(foundUser.id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production"
    });

    // Exclude password from return payload
    const { password: _, ...userWithoutPassword } = foundUser;
    return res.status(200).json(formatUser(userWithoutPassword));

  } catch (error) {
    return res.status(500).json({ message: `internal server error: ${error.message}` });
  }
};

export const Logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: `logout error: ${error.message}` });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }
    email = email.trim().toLowerCase();

    const foundUser = await prisma.user.findUnique({
      where: { email }
    });

    // To prevent user enumeration attacks:
    // We return a generic success message even if the user is not found.
    if (!foundUser) {
      return res.status(200).json({
        message: "If an account exists with that email, a password reset link has been sent."
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token using SHA-256
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user in DB
    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: tokenExpiry
      }
    });

    // Send email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account. Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #2b6cb0; text-align: center;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your Kavach account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3182ce; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This password reset link will expire in 15 minutes.</p>
        <p>If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.875rem; color: #718096; text-align: center;">
          Kavach AI Voice Assistant.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: foundUser.email,
        subject: "Password Reset Request - Kavach",
        message,
        html
      });

      return res.status(200).json({
        message: "If an account exists with that email, a password reset link has been sent."
      });
    } catch (emailErr) {
      // If email sending fails, clean up the token in DB to avoid invalid state
      await prisma.user.update({
        where: { id: foundUser.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpire: null
        }
      });
      console.error("Email send error:", emailErr);
      return res.status(500).json({ message: `Email could not be sent: ${emailErr.message}` });
    }

  } catch (error) {
    return res.status(500).json({ message: `internal server error: ${error.message}` });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash incoming token using SHA-256 to match the database record
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching token and unexpired date
    const foundUser = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: {
          gt: new Date()
        }
      }
    });

    if (!foundUser) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token fields
    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    });

    return res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    return res.status(500).json({ message: `internal server error: ${error.message}` });
  }
};