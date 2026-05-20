
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        blockquote: {
            type: String,
            trim: true
        },

        bannerImage: {
            type: String,
            required: true
        },

        readTime: {
            type: String,
            default: "3 min read"
        },

        trendsList: [
            {
                title: { type: String },
                desc: { type: String }
            }
        ],

        authorType: {
            type: String,
            enum: ['Admin', 'Vendor'],
            required: true
        },

        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'authorType'
        },

        authorCustomName: {
            type: String,
            required: true
        },

        tags: [{ type: String }],

        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },

        isActive: {
            type: Boolean,
            default: true
        }

    }, { timestamps: true });

export default mongoose.model('Blog', blogSchema);