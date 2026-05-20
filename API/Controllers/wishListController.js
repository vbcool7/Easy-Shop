
import mongoose from 'mongoose';
import WishList from '../Models/wishListModelSchema.js';
import Product from '../Models/productModelSchema.js';

export const addWishList = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, selectedColor, selectedSize, prodImage } = req.body;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID" });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let wishList = await WishList.findOne({ userId });

        if (!wishList) {
            wishList = new WishList({
                userId,
                items: [{ productId, selectedColor, selectedSize, prodImage }]
            });
        } else {
            const alreadyExists = wishList.items.some(
                item => item.productId.toString() === productId
            );

            if (alreadyExists) {
                wishList.items = wishList.items.filter(
                    item => item.productId.toString() !== productId
                );
                await wishList.save();
                return res.status(200).json({ success: true, message: "Removed from wishlist" });
            }

            wishList.items.push({ productId, selectedColor, selectedSize, prodImage });
        }

        await wishList.save();
        return res.status(200).json({ success: true, message: "Added to wishlist" });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getWishList = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishList = await WishList.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'prodName price prodImage stock slug'
        });

        if (!wishList || wishList.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Wishlist is empty",
                data: {
                    items: []
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Here is your wishList items",
            count: wishList.items.length,
            data: wishList
        });

    } catch (err) {
        console.log("Error : ", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const clearWishList = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishList = await WishList.findOne({ userId });

        if (!wishList) {
            return res.status(404).json({
                success: false,
                message: "Wishlist already empty or not found"
            });
        }

        wishList.items = [];

        await wishList.save();

        return res.status(200).json({
            success: true,
            message: "Oops... Wishlist Empty Now!",
            data: wishList
        });

    } catch (err) {
        console.log("Error : ", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const checkWishlistStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { prod_id } = req.params;

        const wishList = await WishList.findOne({ userId });
        const exists = wishList ? wishList.items.some(item => item.prod_id.toString() === prod_id) : false;

        res.status(200).json({
            success: true,
            inWishlist: exists
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Serever Error Occur"
        });
    }
};