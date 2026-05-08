
import Product from '../Models/productModelSchema.js';
import Category from '../Models/categoryModelSchema.js';
import SubCategory from '../Models/subCategoryModelSchema.js';
import Vendor from '../Models/vendorModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import { deleteOldFileFromCloudinary, cleanupUploadedFiles, deleteGalleryImages } from '../utils/cloudinaryUtils.js';
import mongoose from 'mongoose';

export const addProduct = async (req, res) => {
    try {
        const { subCat_id } = req.params;
        const { prodName, description, price, originalPrice, stock, attributes, colorAttrName, colorValues } = req.body;

        // check if color variant product
        const isColorVariant = !!colorAttrName && !!colorValues;

        // 1. Mandatory Fields Check (Sabse Pehle)
        if (!prodName || !description || !price || !originalPrice || !stock || !attributes) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "All fields and primary image are mandatory"
            });
        }

        // for non-color variant, prodImage is required
        if (!isColorVariant) {
            const hasProdImage = req.files?.some(f => f.fieldname === 'prodImage');
            if (!hasProdImage) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Primary image is mandatory"
                });
            }
        }

        // 2. Fetch SubCategory to get allowedAttributes
        const subCategory = await SubCategory.findById(subCat_id);
        if (!subCategory) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(404).json({
                success: false,
                message: "Sub-Category not found"
            });
        }

        if (Number(price) > Number(originalPrice)) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Sale price cannot be more than MRP"
            });
        }

        // 3. Dynamic Attribute Validation
        let incomingAttrs;
        try {
            incomingAttrs = typeof attributes === 'string'
                ? JSON.parse(attributes)
                : attributes;
        } catch (e) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Invalid attributes format"
            });
        }

        const allowedKeys = subCategory.allowedAttributes.map(a => a.name);
        const isValid = Object.keys(incomingAttrs).every(key => allowedKeys.includes(key));

        if (!isValid) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "One or more attributes are invalid for this category"
            });
        }

        // 4. Identity & Slug
        const vendorId = req.user.role === 'vendor' ? req.user.id : null;
        const addedBy = req.user.id;
        const role = req.user.role;
        const baseSlug = prodName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

        // Slug unique banane ke liye vendorId ya timestamp jodna achha hai
        const finalSlug = vendorId ? `${baseSlug}-${vendorId}` : `${baseSlug}-admin`;

        // 5. Duplicate Check
        const prodAlreadyExists = await Product.findOne({ slug: finalSlug, vendorId });
        if (prodAlreadyExists) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(409).json({
                success: false,
                message: "Product with this name already exists."
            });
        }

        // 6. Handle images
        let prodImage = '';
        let prodImages = [];

        if (isColorVariant) {
            // Parse color values
            const colors = JSON.parse(colorValues);

            // Group uploaded files by color
            const colorImagesMap = {}; // { Red: [url1, url2], Pink: [url3] }

            req.files.forEach(file => {
                // fieldname format: colorImg_Red_0
                if (file.fieldname.startsWith('colorImg_')) {
                    const parts = file.fieldname.split('_');
                    // parts = ['colorImg', 'Red', '0']
                    const colorName = parts[1];
                    if (!colorImagesMap[colorName]) colorImagesMap[colorName] = [];
                    colorImagesMap[colorName].push(file.path); // cloudinary URL
                }
            });

            // Store color images in attributes
            incomingAttrs[colorAttrName] = {
                ...incomingAttrs[colorAttrName],
                images: colorImagesMap
            };

            // Set prodImage and prodImages from first color's images
            const firstColor = colors[0];
            const firstColorImages = colorImagesMap[firstColor] || [];
            prodImage = firstColorImages[0] || '';
            prodImages = firstColorImages.slice(1);

        } else {
            // Non-color variant — existing logic
            prodImage = req.files.find(f => f.fieldname === 'prodImage')?.path || '';
            prodImages = req.files
                .filter(f => f.fieldname === 'prodImages')
                .map(f => f.path);
        }

        let finalStock = parseInt(stock); // frontend already sends correct stock

        // this block is now redundant since frontend calculates stock correctly
        // but keep as safety net
        if (incomingAttrs['Size']?.stock && Object.keys(incomingAttrs['Size'].stock).length > 0) {
            finalStock = Object.values(incomingAttrs['Size'].stock)
                .reduce((sum, s) => sum + (parseInt(s) || 0), 0);
        } else if (incomingAttrs[colorAttrName]?.stock && Object.keys(incomingAttrs[colorAttrName]?.stock || {}).length > 0) {
            finalStock = Object.values(incomingAttrs[colorAttrName].stock)
                .reduce((sum, s) => sum + (parseInt(s) || 0), 0);
        }

        const newProduct = new Product({
            vendorId,
            catId: subCategory.catId,
            subCatId: subCat_id,
            prodName,
            slug: finalSlug,
            description,
            prodImage,
            prodImages,
            price,
            originalPrice,
            stock: finalStock,
            attributes: incomingAttrs,
            addedBy,
            role,
            status: role === 'Admin' ? 'Approved' : 'Pending'
        });

        await newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: newProduct
        });

    } catch (err) {
        console.error("Add Product Error:", err);
        if (req.files) await cleanupUploadedFiles(req.files);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// user
export const allProductList = async (req, res) => {
    try {
        const { catId, subCatId, vendorId, isNewArrival, isBestSeller, sort, minPrice, maxPrice, ...filters } = req.query;

        let query = { status: "Approved", isActive: true };
        let sortQuery = { createdAt: -1 };

        // cat/subcat filter
        if (catId) query.catId = catId;
        if (subCatId) query.subCatId = subCatId;
        if (vendorId) query.vendorId = vendorId;

        // price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // arrival and best seller
        if (isNewArrival === "true") query.isNewArrival = true;
        if (isBestSeller === "true") query.isBestSeller = true;

        // sorting
        if (sort === "priceLow") sortQuery = { price: 1 };
        if (sort === "priceHigh") sortQuery = { price: -1 };
        if (sort === "bestSeller") sortQuery = { totalSold: -1 };

        // Dynamic Attributes Filtering
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                query[`attributes.${key}`] = filters[key];
            }
        });

        //  console.log("1. Filters received:", filters);
        // console.log("2. Query built:", JSON.stringify(query));

        const products = await Product.find(query).sort(sortQuery);

        // console.log("3. Products found count:", products.length);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (err) {
        console.error("List fetching Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const getProductFilterOptions = async (req, res) => {
    try {
        const { catId } = req.params;
        const { subCatId } = req.query;

        const query = {
            catId,
            status: 'Approved',
            isActive: true
        };

        // if subcat selected, filter by it
        if (subCatId) query.subCatId = subCatId;

        const products = await Product.find(query).select('attributes');

        const filterOptions = {};
        products.forEach(product => {
            if (!product.attributes) return;
            product.attributes.forEach((value, key) => {
                if (!filterOptions[key]) filterOptions[key] = new Set();
                filterOptions[key].add(value);
            });
        });

        // convert Sets to arrays
        const result = {};
        Object.entries(filterOptions).forEach(([key, valueSet]) => {
            result[key] = Array.from(valueSet);
        });

        return res.status(200).json({
            success: true,
            message: "Here is result",
            data: result
        });

    } catch (err) {
        console.error("Filter options error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user
export const detailProductPublic = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findOne({
            _id: prod_id,
            isActive: true,
            status: 'Approved'
        })
            .populate('subCatId', 'subCatName')
            .populate('catId', 'catName')
            .populate('vendorId', 'storeLogo storeName aboutShop address city state pincode businessEmail businessContact');

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found or currently unavailable"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product detail fetched successfully",
            data: product
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// user
export const getSimilarProducts = async (req, res) => {
    try {
        const { prod_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(prod_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(prod_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let similarProducts = await Product.find({
            subCatId: product.subCatId,
            _id: { $ne: prod_id },
            status: 'Approved',
            isActive: true
        })
            .select('prodName prodImage price description originalPrice averageRating totalReviews slug')
            .limit(5);

        // Backup Plan - if prods not enough then fall into cat
        if (similarProducts.length < 4) {
            similarProducts = await Product.find({
                catId: product.catId,
                _id: { $ne: prod_id },
                status: 'Approved',
                isActive: true
            })
                .select('prodName prodImage price description originalPrice averageRating totalReviews slug')
                .limit(5);
        }

        res.status(200).json({
            success: true,
            message: "Here are similar products",
            data: similarProducts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// user - vendor shop prods
export const getVendorShopProducts = async (req, res) => {
    try {
        const { vendor_id } = req.params;

        // 1. Frontend se page aur limit lo
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        // 2. Skip calculate karo (e.g., page 2 ke liye pehle 12 products skip honge)
        const skip = (page - 1) * limit;

        // 3.
        const products = await Product.find({
            vendorId: vendor_id,
            isActive: true,
            status: 'Approved',
        })
            .skip(skip)
            .limit(limit)
            .select('prodName prodImage price originalPrice averageRating totalReviews slug')
            .sort({ createdAt: -1 });

        // 4. Total products count karo taaki frontend ko pata chale aur data hai ya nahi
        const totalProducts = await Product.countDocuments({ vendorId: vendor_id });
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            message: "Specific vendor products",
            data: products,
            totalPages,
            currentPage: page
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// get vendor prods
export const getAdminProducts = async (req, res) => {
    try {
        let query = {};

        // Role-based logic
        if (req.user.role === 'vendor') {
            // Vendor ko sirf uske apne products dikhao (Pending/Rejected sab)
            query.addedBy = req.user.id;
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        const products = await Product.find(query)
            .populate("catId", "catName")
            .populate("subCatId", "subCatName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            message: "Here is products list",
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const detailProduct = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership Check
        const ownerId = product.vendorId || product.addedBy;

        if (req.user.role !== 'admin' && ownerId?.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only watch out your own products."
            });
        }

        res.status(200).json({
            success: true,
            message: `Here is ${req.user.role}'s product detail`,
            data: product
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

export const updateProduct = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const { prodName, description, price, originalPrice, stock, isActive } = req.body;

        const updates = {};

        const product = await Product.findById(prod_id);
        if (!product) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership Check: Agar user Admin nahi hai, toh check karo ki wahi owner hai ya nahi
        if (req.user.role !== 'admin' && product.vendorId.toString() !== req.user.id.toString()) {
            if (req.files) await cleanupUploadedFiles(req.files);
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only edit your own products."
            });
        }

        // Agar vendor edit kar raha hai, toh status reset karna ek acchi practice hai
        if (req.user.role === 'vendor') {
            updates.status = 'Pending';
        }

        if (prodName) {
            updates.prodName = prodName.trim();
            updates.slug = prodName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

            const alreadyExists = await Product.findOne({
                // subCatId: Product.subCatId,
                _id: { $ne: prod_id },
                $or: [{ prodName: updates.prodName }, { slug: updates.slug }]
            });

            if (alreadyExists) {
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Another product with this name/slug already exists"
                });
            }
        }

        // Frontend se poora merged object aayega, hum use as-is overwrite karenge
        if (req.body.attributes) {
            try {
                updates.attributes = typeof req.body.attributes === 'string'
                    ? JSON.parse(req.body.attributes)
                    : req.body.attributes;
            } catch (error) {
                console.error("Attributes parsing error:", error);
                if (req.files) await cleanupUploadedFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: "Invalid attributes format"
                });
            }
        }

        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = price;
        if (originalPrice !== undefined) updates.originalPrice = originalPrice;
        if (stock !== undefined) updates.stock = stock;
        if (isActive !== undefined) updates.isActive = isActive;

        if (req.files && Object.keys(req.files).length > 0) {

            // A. Main Image Update
            if (req.files['prodImage'] && req.files['prodImage'].length > 0) {
                if (product.prodImage) {
                    await deleteOldFileFromCloudinary(product.prodImage);
                }
                updates.prodImage = req.files['prodImage'][0].path;
            }

            // B. Gallery Update
            if (req.files['prodImages'] && req.files['prodImages'].length > 0) {
                if (product.prodImages && product.prodImages.length > 0) {
                    await deleteGalleryImages(product.prodImages);
                }
                updates.prodImages = req.files['prodImages'].map(file => file.path);
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            prod_id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    }
};

export const getMyCategories = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        const categories = await Category.find({ type: vendor.vendorType });

        res.status(200).json({
            success: true,
            message: "Here is vendor's category",
            data: categories
        });
    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Error"
        });
    }
};

export const getSubCategoriesByCategories = async (req, res) => {
    try {
        const { type } = req.params; // Maslan: "Electronics"

        // 1. Pehle 'Category' collection mein jaao aur us name/type ki ID nikalo
        const category = await Category.findOne({
            catName: { $regex: new RegExp(`^${type}$`, "i") }
        });

        if (!category) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 2. Ab 'SubCategory' collection mein 'catId' se find karo
        const subCategories = await SubCategory.find({ catId: category._id });

        console.log(`Found ${subCategories.length} sub-categories for ${type}`);

        res.status(200).json({
            success: true,
            data: subCategories
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// only admin dlt prod
export const deleteProduct = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership Check
        const userId = req.user._id || req.user.id;
        if (req.user.role !== 'admin' && product.vendorId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only delete your own products."
            });
        }

        // Main Image
        if (product.prodImage) {
            try {
                await deleteOldFileFromCloudinary(product.prodImage);
            } catch (imgErr) {
                console.log("Main image delete failed, skipping...", imgErr);
            }
        }

        // Gallery Images
        if (product.prodImages && product.prodImages.length > 0) {
            try {
                await deleteGalleryImages(product.prodImages);
            } catch (imgErr) {
                console.log("Gallery images delete failed, skipping...", imgErr);
            }
        }

        await Product.findByIdAndDelete(prod_id);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    }
};

// agar admin side se prod approve ho gya but vendor k pass stock nhi h to wo inactive kr skta h
export const toggleProductActive = async (req, res) => {
    try {
        const { prod_id } = req.params;

        const product = await Product.findById(prod_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        };

        // Ownership Check
        const ownerId = product.vendorId || product.addedBy;

        if (req.user.role !== 'admin' && ownerId?.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! You can only active or inactive your own products."
            });
        }

        product.isActive = !product.isActive;
        await product.save();

        res.status(200).json({
            status: true,
            message: `Product is now ${product.isActive ? "Active" : "Inactive"}`,
            isActive: product.isActive
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    };
};

export const countProducts = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { $or: [{ vendorId: req.user.id }, { addedBy: req.user.id }] };

        const product = await Product.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: "Total Products are : ",
            data: product
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        })
    }
};

// for search bar
export const getFilteredProducts = async (req, res) => {
    try {
        const { search, sort, catId, subCatId, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        // Base Query (Sirf wahi jo approved aur active hain
        let query = { isActive: true, status: "Approved" };

        // Search Logic (Name ya Description mein search karega)
        if (search) {
            query.$or = [
                { prodName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // cat and subcat filter
        if (catId) query.catId = catId;
        if (subCatId) query.subCatId = subCatId;

        // price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // price sort filter
        let sortQuery = { createdAt: -1 };
        if (sort === 'priceLow') sortQuery = { price: 1 };
        if (sort === 'priceHigh') sortQuery = { price: -1 };

        // 6. Pagination & Execution
        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit));

        // 7. Total Count (Frontend pagination ke liye)
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / limit),
            data: products
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            status: false,
            message: "Serever Error Occur"
        });
    }
};

// stock inventory - vendor dashboard
export const getInventoryStats = async (req, res) => {
    try {
        let filter = {};

        // VENDOR FILTER FIX:
        if (req.user.role === 'vendor') {
            filter = { vendorId: new mongoose.Types.ObjectId(req.user.id) };
        }

        const stats = await Product.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalInventory: { $sum: "$stock" },
                    inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    lowStockAlert: {
                        $sum: { $cond: [{ $lte: ["$stock", 20] }, 1, 0] }
                    },
                    outOfStock: {
                        $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
                    }
                }
            }
        ]);

        const defaultStats = {
            totalInventory: 0,
            inventoryValue: 0,
            lowStockAlert: 0,
            outOfStock: 0
        };

        res.status(200).json({
            success: true,
            data: stats.length > 0 ? stats[0] : defaultStats
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// top selling prods - vendor dashboard
export const getTopSellingProducts = async (req, res) => {
    try {
        const vId = new mongoose.Types.ObjectId(req.user.id);

        const topProducts = await Order.aggregate([
            // 1. Sirf is vendor ke delivered orders uthao
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $match: { "productDetails.vendorId": vId, "orderStatus": "Delivered" } },

            // 2. Product wise sales count calculate karo
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$productDetails.prodName" },
                    image: { $first: "$productDetails.prodImage" }, // Array ka pehla image
                    price: { $first: "$productDetails.price" },
                    totalSales: { $sum: "$items.quantity" }
                }
            },

            // 3. Sabse zyada sales wale products upar rakho aur limit karo
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            message: "Here is top selling prods list",
            data: topProducts
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// stock alert - vendor dashboard
export const getStockAlerts = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const alerts = await Product.find({
            vendorId: vendorId,
            stock: { $lte: 20 }, // 20 ya usse kam wale saare 'Low' aur 'Critical' products
            isActive: true
        })
            .sort({ stock: 1 });

        res.status(200).json({
            success: true,
            message: "Here is data",
            // Virtual 'stockStatus' automatic JSON mein include ho jayega
            data: alerts
        });
    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};