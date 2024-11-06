import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;


  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // req.headers?.cookie?.split(' ')[0].replace("userData=", '') ?? ''
      // req.headers.authorization.split(' ')[1];

     

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      res.status(401);
      next(new Error("Not authorized, token failed"));
    }
  } else if (req.headers.cookie) {
    token = req.headers.cookie;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    next();
  } else {
    res.status(401);
    next(new Error("Not authorized, no token"));
  }
};

export const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    next(new Error("Not authorized as an admin"));
  }
};

// src/middlewares/authMiddleware.ts

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Access denied: insufficient permissions"));
    }
    next();
  };
};
