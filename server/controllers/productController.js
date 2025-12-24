import Product from "../models/Product.js";
import Order from "../models/Order.js";
// export const createProduct = async (req, res) => {
//   try {
//     const { title, description, price, category } = req.body;

//     const images =
//       req.files && Array.isArray(req.files)
//         ? req.files.map((f) => f.path)
//         : [];

//     const product = await Product.create({
//       title,
//       description,
//       price,
//       category,
//       images,
//       seller: req.user._id,
//       college: req.user.college,
//       hostel: req.user.hostel
//     });

//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const createProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!req.body) {
      console.error("createProduct: empty req.body");
      return res.status(400).json({ message: "Request body is empty" });
    }

    const { title, description, price, category,images} = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // for now, ignore images to avoid Multer issues
    const product = await Product.create({
      title,
      description,
      price,
      category,
      images: images || [],
      seller: req.user._id,
      college: req.user.college,
      hostel: req.user.hostel
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error creating product" });
  }
};

// export const getProducts = async (req, res) => {
//   try {
//     const { q, category, minPrice, maxPrice } = req.query;
//     const filter = { isSold: false };

//     if (q) filter.title = { $regex: q, $options: "i" };
//     if (category) filter.category = category;
//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = Number(minPrice);
//       if (maxPrice) filter.price.$lte = Number(maxPrice);
//     }

//     const products = await Product.find(filter)
//       .populate("seller", "name hostel department")
//       .sort("-createdAt");

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    const filter = { isSold: false };

    if (q) filter.title = { $regex: q, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("seller", "name hostel department")
      .sort("-createdAt");

    return res.json(products);
  } catch (err) {
    console.error("getProducts error:", err); // <- important
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching products" });
  }
};

// controllers/productController.js
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort("-createdAt");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching products" });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email hostel department"
    );
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



export const cancelListing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // only seller can cancel
    if (!product.seller.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // delete any orders for this product (optional: only non-completed)
    await Order.deleteMany({
      product: product._id,
      status: { $in: ["OPEN", "ASSIGNED"] },
    });

    await product.deleteOne();

    return res.json({ message: "Listing cancelled and removed" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error cancelling listing" });
  }
};


