import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            url: {
                type: String, //cloudinary url
                required: true
            },
            publicId: {
                type: String, //cloudinary public id
                required: true
            },
            resource_type: {
                type: String, //video or image
                required: true
            }
        },
        thumbnail: {
            url: {
                type: String, //cloudinary url
                required: true
            },
            publicId: {
                type: String, //cloudinary public id
                required: true
            },
            resource_type: {
                type: String, //video or image
                required: true
            }
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)