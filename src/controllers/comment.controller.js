import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const comments = await Comment.find({ videoId })
    .skip(skip)
    .limit(Number(limit))
    .populate("user", "username profilePicture")
    .sort({ createdAt: -1 });
  const totalComments = await Comment.countDocuments({ videoId });
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
      },
      "Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  // Check if content is provided
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content cannot be empty");
  }
  // Check if videoId is valid
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  // Create a new comment
  const newComment = await Comment.create({
    content,
    videoId,
    owner: req.user._id,
  });
  if (!newComment) {
    throw new ApiError(500, "Failed to add comment");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  // Check if content is provided
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content cannot be empty");
  }
  // Check if commentId is valid
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }
  // Find and update the comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  // Check if commentId is valid
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }
  // Find and delete the comment
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
