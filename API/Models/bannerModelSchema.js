
import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
    {
        zone: {
            type: String,
            enum: ['home_hero', 'home_mid', 'category_top', 'vendor_top'],
            required: true
        },

        badge: String,

        headingMain: String,

        headingAccent: String,

        paragraph: String,

        image: String,

        ctaLink: String,

        ctaText: String,

        offerText: String,

        isActive: {
            type: Boolean,
            default: false
        },

        order: {
            type: Number,
            default: 0
        },
    },

    { timestamps: true }
)

export default mongoose.model('Banner', bannerSchema)