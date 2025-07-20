import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, ownerId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const filter = {} // Initialized filter object
    if (query) {
        filter.title = { $regex: query, $options: 'i' } // Case-insensitive search
    }
    if (ownerId) {
        if (!isValidObjectId(ownerId)) {
            throw new ApiError(400, "Invalid Owner ID")
        }
        filter.owner = ownerId // Filter by user ID
    }

    const sort = {} // Initialized sort object
    if (sortBy) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1
    } else {
        sort.createdAt = -1 // Default sort by createdAt in descending order
    }
    const options = { // Pagination and sorting options
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort
    }
    const videos = await Video.aggregatePaginate(Video.aggregate().match(filter), options)


    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            videos, 
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const { videoFile, thumbnail } = req.files
    if (!videoFile || !thumbnail) { // Check if both files are provided
        throw new ApiError(400, "Video file and thumbnail are required")
    }
    const video = await uploadOnCloudinary(videoFile[0].path) // Upload video to Cloudinary
    const thumb = await uploadOnCloudinary(thumbnail[0].path) // Upload thumbnail to Cloudinary

    const newVideo = await Video.create({ // Create new video document
        videoFile: {
            url: video.secure_url,
            publicId: video.public_id,
            resource_type: video.resource_type
        },
        thumbnail: {
            url: thumb.secure_url,
            publicId: thumb.public_id,
            resource_type: thumb.resource_type
        },
        title,
        description,
        duration: videoFile[0].duration, // Assuming duration is available in the file metadata
        owner: req.user._id, // Assuming user is authenticated and req.user is set
        isPublished: true,
    })

    if (!newVideo) {
        throw new ApiError(500, "Failed to create video")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                newVideo, 
                "Video published successfully"
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) { // Validate videoId
        throw new ApiError(400, "Invalid Video ID")
    }
    const video = await Video.findById(videoId).populate("owner", "name avatar") // Populate owner field with user details
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                video, 
                "Video fetched successfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) { // Validate videoId
        throw new ApiError(400, "Invalid Video ID")
    }

    const { title, description } = req.body
    const updateData = {} // Initialize update data object
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (req.file) {
        // If a new thumbnail is uploaded, delete the old one from Cloudinary
        const oldVideo = await Video.findById(videoId)
        if (!oldVideo) {
            throw new ApiError(404, "Video not found")
        }
        await deleteFromCloudinary(oldVideo.thumbnail.publicId, oldVideo.thumbnail.resource_type)
        // Upload the new thumbnail to Cloudinary
        if (!req.file.path) {
            throw new ApiError(400, "Thumbnail file is required")
        }
        const thumbnail = await uploadOnCloudinary(req.file.path)
        updateData.thumbnail = {
            url: thumbnail.secure_url,
            publicId: thumbnail.public_id,
            resource_type: thumbnail.resource_type
        }
    }
    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, { new: true })
    if (!updatedVideo) {
        throw new ApiError(404, "Video not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                updatedVideo, 
                "Video updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) { // Validate videoId
        throw new ApiError(400, "Invalid Video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    // Delete video from Cloudinary
    await deleteFromCloudinary(video.videoFile.publicId, video.videoFile.resource_type)
    // Delete thumbnail from Cloudinary
    await deleteFromCloudinary(video.thumbnail.publicId, video.thumbnail.resource_type)
    // Delete video from database
    await Video.findByIdAndDelete(videoId)
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {}, 
                "Video deleted successfully"
            )
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: toggle publish status of video
    if (!isValidObjectId(videoId)) { // Validate videoId
        throw new ApiError(400, "Invalid Video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished
    await video.save({validateBeforeSave: true})
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                video, 
                `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`
            )
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
