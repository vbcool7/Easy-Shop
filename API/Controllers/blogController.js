
import Blog from '../Models/blogModelSchema.js';
import { deleteCloudinaryFiles, deleteOldFileFromCloudinary } from '../utils/cloudinaryUtils.js'; // err + update

// add blog - vendor + admin
export const createBlog = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            content,
            blockquote,
            bannerImage,
            readTime,
            trendsList,
            tags
        } = req.body;

        const bannerImagePath = req.file ? req.file.path : "";

        let parsedTrendsList = [];
        let parsedTags = [];

        if (req.body.trendsList) {
            // Agar trendsList string hai toh use array object me convert karo
            parsedTrendsList = typeof req.body.trendsList === 'string'
                ? JSON.parse(req.body.trendsList)
                : req.body.trendsList;
        }

        if (req.body.tags) {
            // Same tags ke liye bhi parsing handle karo
            parsedTags = typeof req.body.tags === 'string'
                ? JSON.parse(req.body.tags)
                : req.body.tags;
        }

        if (!title || !category || !description || !content || !bannerImagePath) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "Required fields are missing!"
            });
        }

        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "A blog with this title already exists!"
            });
        }

        // auth check
        const userRole = req.user.role;
        const userId = req.user._id || req.user.id;

        let authorType = 'Vendor';
        let status = 'Pending';
        let authorCustomName = req.user.storeName || req.user.name || "Vendor Partner";

        if (userRole.toLowerCase() === 'admin') {
            authorType = 'Admin';
            status = 'Approved';
            authorCustomName = "EasyShop Team";
        }

        const newBlog = new Blog({
            title,
            slug,
            category,
            description,
            content,
            blockquote,
            bannerImage: bannerImagePath,
            readTime,
            trendsList: parsedTrendsList,
            tags: parsedTags,
            authorType,
            authorId: userId,
            authorCustomName,
            status
        });

        await newBlog.save();

        res.status(201).json({
            success: true,
            message: status === 'Approved' ? "Blog published successfully!" : "Blog submitted for Admin approval!",
            blog: newBlog
        });

    } catch (err) {
        console.log("Error : ", err);
        if (req.file) await deleteCloudinaryFiles(req.file);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// update blog - vendor + admin
export const updateBlog = async (req, res) => {
    try {
        const { blog_id } = req.params;
        const {
            title,
            category,
            description,
            content,
            blockquote,
            bannerImage,
            readTime,
            trendsList,
            tags
        } = req.body;

        const blog = await Blog.findById(blog_id);

        if (!blog) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const updates = {};

        if (title) {
            updates.title = title.trim();
            updates.slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

            const alreadyExists = await Blog.findOne({
                _id: { $ne: blog_id },
                $or: [{ title: updates.title }, { slug: updates.slug }]
            });

            if (alreadyExists) {
                if (req.file) await deleteCloudinaryFiles(req.file);
                return res.status(400).json({
                    success: false,
                    message: "Another blog with this title already exists"
                });
            }
        }

        if (category !== undefined) updates.category = category;
        if (description !== undefined) updates.description = description;
        if (content !== undefined) updates.content = content;
        if (blockquote !== undefined) updates.blockquote = blockquote;
        if (readTime !== undefined) updates.readTime = readTime;

        // Handle trendsList array parsing safely if it comes as a JSON string
        if (trendsList !== undefined) {
            try {
                updates.trendsList = typeof trendsList === 'string' ? JSON.parse(trendsList) : trendsList;
            } catch (e) {
                console.log("trendsList parse error:", e);
                updates.trendsList = trendsList;
            }
        }

        // Handle tags array parsing safely if it comes as a JSON string
        if (tags !== undefined) {
            try {
                updates.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                console.log("tags parse error:", e);
                updates.tags = tags;
            }
        }

        if (req.file) {
            if (blog.bannerImage) {
                await deleteOldFileFromCloudinary(blog.bannerImage);
            }
            updates.bannerImage = req.file.path;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            blog_id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updateBlog
        });

    } catch (err) {
        console.log("Error : ", err);
        if (req.file) await deleteCloudinaryFiles(req.file);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// list - vendor blogs
export const vendorBlogList = async (req, res) => {
    try {
        const vendorId = req.user._id || req.user.id;
        const { search = '', page = 1, limit = 10, status = '' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = { authorId: vendorId };

        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: regex },
                { category: regex },
                { readTime: regex },
                { status: regex }
            ];
        }

        if (status.trim()) {
            query.status = status;
        }

        const [blogs, total] = await Promise.all([
            Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Blog.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / limitNum),
            data: blogs
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// active/inactive - vendor blogs
export const toggleBlogVisibility = async (req, res) => {
    try {
        const { blog_id } = req.params;
        const vendorId = req.user._id || req.user.id;

        const blog = await Blog.findById(blog_id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (blog.authorId.toString() !== vendorId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action"
            });
        }

        blog.isActive = !blog.isActive

        await blog.save();

        return res.status(200).json({
            success: true,
            message: `Blog is now ${blog.isActive ? 'Visible (Active)' : 'Hidden (Inactive)'}`,
            isActive: blog.isActive
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// user - blog list 
export const blogList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const queryFilter = { status: "Approved", isActive: true };

        const blogs = await Blog.find(queryFilter)
            .skip(skip)
            .limit(limit)
            .select("title category description content blockquote bannerImage readTime trendsList tags createdAt authorCustomName")
            .sort({ createdAt: -1 });

        const totalBlogs = await Blog.countDocuments(queryFilter);
        const totalPages = Math.ceil(totalBlogs / limit);

        if (blogs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No blogs found on this page",
                blogs: [],
                hasMore: false
            });
        }

        return res.status(200).json({
            success: true,
            count: blogs.length,
            totalBlogs,
            totalPages,
            currentPage: page,
            hasMore: page < totalPages,
            blogs
        });

    } catch (err) {
        console.error("Pagination Blog List Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// user - blog detail
export const getBlogById = async (req, res) => {
    try {
        const { blog_id } = req.params;

        const blog = await Blog.findById(blog_id).populate('authorId', 'storeLogo storeName profileImage');;

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (blog.status !== "Approved" || !blog.isActive) {
            return res.status(403).json({
                success: false,
                message: "This blog is not published yet or has been restricted"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Here is Blog details",
            blog
        });

    } catch (err) {
        console.error("Get Blog Detail Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// user - realted blog
export const getRelatedBlogs = async (req, res) => {
    try {
        const { blog_id } = req.params;

        const limit = parseInt(req.query.limit) || 3;

        const currentBlog = await Blog.findById(blog_id).select('category tags');

        if (!currentBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const relatedBlogs = await Blog.find({
            _id: { $ne: blog_id },
            status: "Approved",
            isActive: true,
            $or: [
                { category: currentBlog.category },
                { tags: { $in: currentBlog.tags } }
            ]
        })
            .limit(limit)
            .select("title category description bannerImage readTime authorCustomName createdAt tags")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: relatedBlogs.length,
            relatedBlogs
        });

    } catch (err) {
        console.error("Get Related Blogs Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};
