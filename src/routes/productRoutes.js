import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  searchProducts,
  deleteProduct,
  filterProducts,
  getFeaturedProducts,
  getBestSellerProducts,
} from "../controllers/productController.js";

const router = express.Router();

const asyncHandler = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};

// GET products
router.get("/", asyncHandler(getProducts));
router.get("/search/:keyword", asyncHandler(searchProducts));
router.get("/filter/all", asyncHandler(filterProducts));
router.get("/featured", asyncHandler(getFeaturedProducts));
router.get("/best-sellers", asyncHandler(getBestSellerProducts));
router.get("/slug/:slug", asyncHandler(getProductBySlug));
router.get("/:id", asyncHandler(getProductById));

// CREATE product: maximum 5 images
router.post(
  "/",
  upload.array("images", 5),
  asyncHandler(createProduct)
);

// UPDATE product: maximum 5 newly uploaded images
router.put(
  "/:id",
  upload.array("images", 5),
  asyncHandler(updateProduct)
);

// DELETE product
router.delete("/:id", asyncHandler(deleteProduct));

export default router;