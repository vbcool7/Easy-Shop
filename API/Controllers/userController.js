
import User from '../Models/userModelSchema.js';
import OTP from '../Models/otpModel.js';
import sendEmail from '../utils/sendEmail.js';
import { deleteCloudinaryFiles } from '../utils/cloudinaryUtils.js'; // err
import { deleteOldFileFromCloudinary } from '../utils/cloudinaryUtils.js'; // update
import { createAdminNotification } from '../utils/createAdminNotifications.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const userSignUp = async (req, res) => {
    try {
        const { name, email, password, contact, address, city, pincode, state } = req.body;
        const profilePhotoPath = req.file ? req.file.path : "";

        if (!name || !email || !password || !contact || !address || !city || !pincode || !state) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "Please fill all the mandatory fields"
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "User already registered with this email"
            });
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            contact,
            profilePhoto: profilePhotoPath || "",
            address,
            city,
            pincode,
            state
        });

        await user.save();
        await OTP.deleteMany({ email, role: 'user' });

        await createAdminNotification({
            type: "NEW_USER",
            title: "New User Registration",
            message: `New user registered: ${user.name} (${user.email})`,
            relatedId: user._id,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully! Welcome to EasyShop.",
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error(err);
        if (req.file) await deleteCloudinaryFiles(req.file);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not registered"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated by Admin. Please contact support."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "This email does not exist"
            });
        }

        try {
            const secret = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '15m' });

            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const link = `${frontendUrl}/reset_password/${user._id}/${token}?role=user`;

            await sendEmail(
                email,
                "Password Reset Request",
                `<h2>EasyShop Password Reset</h2>
                 <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
                 <a href="${link}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                 <p>If you didn't request this, please ignore this email.</p>`
            );

            return res.status(200).json({
                success: true,
                message: "Password reset link sent to your email.",
                link
            });

        } catch (mailErr) {
            console.error("Error in Token/Email Process:", mailErr.message);
            return res.status(500).json({
                success: false,
                message: "Error sending email or generating link"
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { user_id, token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New Password and Confirm Password are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const secret = process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Link expired or invalid"
            });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated!. You can login now."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // verify old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.log("Error :", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const countUser = async (req, res) => {
    try {
        const count = await User.countDocuments();

        res.status(200).json({
            success: true,
            message: "User's Count",
            totalCount: count
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const getUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const loggedInUser = req.user;

        if (loggedInUser.id !== user_id && loggedInUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You can only view your own profile."
            });
        }

        const user = await User.findById(user_id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User detail not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User Detail",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const updateUserDetail = async (req, res) => {
    try {
        const user_id = req.user.id;
        const updates = {};

        const fields = ['name', 'contact', 'address', 'city', 'pincode', 'state'];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findById(user_id);

        if (!user) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // --- EMAIL UPDATE LOGIC ---
        let emailUpdatePending = false;
        const newEmail = req.body.email;

        if (newEmail && newEmail !== user.email) {
            const emailExists = await User.findOne({ email: newEmail });
            if (emailExists) {
                if (req.file) await deleteCloudinaryFiles(req.file);
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            // OTP bhejne ka process
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.findOneAndUpdate(
                { email: newEmail, role: 'user' },
                { otp, role: 'user' },
                { upsert: true, new: true }
            );

            await sendEmail(newEmail, "Verify Your New Email", `Your OTP is: ${otp}`);
            emailUpdatePending = true;
        }

        // --- PHOTO UPDATE LOGIC ---
        if (req.file) {

            if (user.profilePhoto) {
                await deleteOldFileFromCloudinary(user.profilePhoto);
            }
            updates.profilePhoto = req.file.path; // Nayi photo ka URL assign karein
        }

        // --- FINAL DATABASE UPDATE ---
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (emailUpdatePending) {
            return res.status(200).json({
                success: true,
                isEmailUpdatePending: true,
                newEmail: newEmail,
                data: updatedUser, // User ko updated name/photo dikhao
                message: "Basic details updated. Please verify OTP for new email."
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (err) {
        if (req.file) await deleteCloudinaryFiles(req.file);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const userLogout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};