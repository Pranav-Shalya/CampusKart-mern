import User from "../models/User.js";

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const user = await User.findById(req.user._id);
    const exists = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    return res.json({ wishlist: user.wishlist, liked: !exists });
  } catch (err) {
    console.error("toggleWishlist error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error updating wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "title price category images"
    );
    return res.json(user.wishlist || []);
  } catch (err) {
    console.error("getWishlist error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching wishlist" });
  }
};
