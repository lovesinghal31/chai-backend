import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  // Check if user has already liked the video
  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });
  if (existingLike) {
    // User has already liked the video, so remove the like
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked successfully"));
  }
  // User has not liked the video, so add a like
  const newLike = await Like.create({
    likedBy: req.user._id,
    video: videoId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  // Check if commentId is valid
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }
  // Check if user has already liked the comment
  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    comment: commentId,
  });
  if (existingLike) {
    // User has already liked the comment, so remove the like
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  }
  // User has not liked the comment, so add a like
  const newLike = await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  // Check if tweetId is valid
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }
  // Check if user has already liked the tweet
  const existingLike = await Like.findOne({
    likedBy: req.user._id,
    tweet: tweetId,
  });
  if (existingLike) {
    // User has already liked the tweet, so remove the like
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  }
  // User has not liked the tweet, so add a like
  const newLike = await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // Check if user has liked any videos
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null },
  })
    .populate("video", "title description thumbnailUrl")
    .sort({ createdAt: -1 });
  if (likedVideos.length === 0) {
    throw new ApiError(404, "No liked videos found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos retrieved successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
