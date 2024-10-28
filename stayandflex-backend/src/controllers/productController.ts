import { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const pageSize = Number(req.query.pageSize) || 10;
      const page = Number(req.query.pageNumber) || 1;
  
      const query: any = {};
  
      // Search by keyword
      if (req.query.keyword) {
        query.name = {
          $regex: req.query.keyword,
          $options: 'i', // case-insensitive
        };
      }
  
      // Filter by category
      if (req.query.category) {
        query.category = req.query.category;
      }
  
      // Filter by price range
      if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) {
          query.price.$gte = Number(req.query.minPrice);
        }
        if (req.query.maxPrice) {
          query.price.$lte = Number(req.query.maxPrice);
        }
      }
  
      // Filter by rating
      if (req.query.minRating) {
        query.averageRating = { $gte: Number(req.query.minRating) };
      }
  
      // Get total count for pagination
      const count = await Product.countDocuments(query);
  
      // Fetch products with pagination
      const products = await Product.find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1));
  
      res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        totalProducts: count,
      });
    } catch (error) {
      next(error);
    }
  };

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;

    if (!ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name email"
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = new Product({
      name: "Sample Product",
      price: 0,
      user: req.user?._id,
      images: ["/images/sample.jpg"],
      brand: "Sample Brand",
      category: "Sample Category",
      stock: 0,
      numReviews: 0,
      description: "Sample Description",
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;

    if (!ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(productId);

    if (product) {
      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.description = req.body.description || product.description;
      product.images = req.body.images || product.images;
      product.brand = req.body.brand || product.brand;
      product.category = req.body.category || product.category;
      product.stock = req.body.stock || product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;

    if (!ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(productId);

    if (product) {
      //   await product.remove();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    next(error);
  }
};
