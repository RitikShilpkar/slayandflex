import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import mongoose from "mongoose";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        token: generateToken(updatedUser._id as string),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Please provide current and new passwords");
    }

    const user = await User.findById(req.user?._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(401);
      throw new Error("Current password is incorrect");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      res.json(user.addresses || []);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      const newAddress = {
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
      };

      user.addresses = user.addresses
        ? [...user.addresses, newAddress]
        : [newAddress];

      await user.save();

      res
        .status(201)
        .json({
          message: "Address added successfully",
          addresses: user.addresses,
        });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user && user.addresses) {
      const addressIndex = user.addresses.findIndex(
        (addr) => addr._id?.toString() === req.params.id
      );

      if (addressIndex !== -1) {
        user.addresses[addressIndex] = {
          ...user.addresses[addressIndex],
          ...req.body,
        };

        await user.save();

        res.json({
          message: "Address updated successfully",
          addresses: user.addresses,
        });
      } else {
        res.status(404);
        throw new Error("Address not found");
      }
    } else {
      res.status(404);
      throw new Error("User or addresses not found");
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await User.findById(req.user?._id);
  
      if (user && user.addresses) {
        user.addresses = user.addresses.filter(
          (addr) => addr._id?.toString() !== req.params.id
        );
  
        await user.save();
  
        res.json({ message: 'Address deleted successfully', addresses: user.addresses });
      } else {
        res.status(404);
        throw new Error('User or addresses not found');
      }
    } catch (error) {
      next(error);
    }
  };