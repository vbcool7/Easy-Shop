
import mongoose from 'mongoose'

const cmsContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },

    title: String,

    content: String,

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },

  }, { timestamps: true })

export default mongoose.model('CmsContent', cmsContentSchema);