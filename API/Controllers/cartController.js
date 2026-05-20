
import mongoose from 'mongoose';
import Cart from '../Models/cartModelSchema.js';
import Product from '../Models/productModelSchema.js';

const findMatchingVariant = (product, selectedColor, selectedSize) => {
    const hasColor = product.attributes?.get?.('Color')?.values?.length > 0;
    const hasSize = product.attributes?.get?.('Size')?.values?.length > 0;

    return product.variants.find(v => {
        const colorMatch = hasColor
            ? v.color === selectedColor
            : v.color == null;

        const sizeMatch = hasSize
            ? v.size === selectedSize
            : v.size == null;

        return colorMatch && sizeMatch;
    });
};

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity, selectedColor, selectedSize, prodImage } = req.body;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID"
            });
        }

        const productExists = await Product.findById(productId);

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const variant = findMatchingVariant(
            productExists,
            selectedColor || null,
            selectedSize || null
        );

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: "Invalid variant selected"
            });
        }

        if (variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${variant.stock} items available`
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [{
                    productId,
                    quantity,
                    selectedColor: selectedColor || null,
                    selectedSize: selectedSize || null,
                    variantId: variant._id,
                    prodImage: prodImage || productExists.prodImage
                }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item =>
                item.productId.toString() === productId &&
                item.variantId?.toString() === variant._id.toString()
            );

            if (itemIndex > -1) {
                const newQuantity = cart.items[itemIndex].quantity + quantity;

                if (variant.stock < newQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Only ${variant.stock} items available`
                    });
                }

                cart.items[itemIndex].quantity = newQuantity;
            } else {
                cart.items.push({
                    productId,
                    quantity,
                    selectedColor: selectedColor || null,
                    selectedSize: selectedSize || null,
                    variantId: variant._id,
                    prodImage: prodImage || productExists.prodImage
                });
            }
        }

        await cart.save();

        const populatedCart = await cart.populate('items.productId', 'prodName price prodImage stock attributes variants');

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: populatedCart
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'prodName price prodImage stock slug attributes variants'
        });

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                data: {
                    items: []
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Here is cart list",
            data: cart
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId,variantId, action } = req.body;

        if (!productId || !variantId || !action) {
            return res.status(400).json({
                success: false,
                message: "ProductId, variantId and action are required"
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const index = cart.items.findIndex(item =>
            item.productId.toString() === productId &&
            item.variantId?.toString() === variantId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        // Action Logic
        if (action === "increase") {
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const variant = product.variants.find(
                v => v._id.toString() === variantId
            );

            if (!variant) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid variant"
                });
            }

            if (cart.items[index].quantity + 1 > variant.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${variant.stock} items available`
                });
            }

            cart.items[index].quantity += 1;
        } else if (action === "decrease") {
            if (cart.items[index].quantity > 1) {
                cart.items[index].quantity -= 1;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Minimum quantity reached. Use remove instead."
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        await cart.save();

        const populatedCart = await cart.populate(
            'items.productId',
            'prodName price prodImage stock attributes variants'
        );

        return res.status(200).json({
            success: true,
            message: "Quantity updated",
            data: populatedCart
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { prod_id } = req.params;
        const { variantId } = req.body;

        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: "VariantId is required"
            });
        }

        const updatedCart = await Cart.findOneAndUpdate(
            { userId },
            {
                $pull: {
                    items: {
                        productId: prod_id,
                        variantId: variantId
                    }
                }
            },
            { new: true }
        ).populate('items.productId', 'prodName price prodImage attributes variants');

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            data: updatedCart
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart already empty",
                data: { items: [] }
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Oops... Cart Empty Now!",
            data: cart
        });

    } catch (err) {
        console.log("Error : ", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const countCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });

        const count = cart
            ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
            : 0;

        const uniqueItems = cart ? cart.items.length : 0;

        res.status(200).json({
            success: true,
            count,
            uniqueItems,
            message: `Total cart items are ${count}`
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};