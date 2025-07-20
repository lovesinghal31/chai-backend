import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
  });
  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
  }
  res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const playlists = await Playlist.find({ owner: userId }).populate("videos");
  if (!playlists || playlists.length === 0) {
    throw new ApiError(404, "No playlists found for this user");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists retrieved successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  const playlist = await Playlist.findById(playlistId).populate("videos");
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: add video to playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in the playlist");
  }
  playlist.videos.push(videoId);
  await playlist.save({ validateBeforeSave: true });
  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video not found in the playlist");
  }
  playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);
  await playlist.save({ validateBeforeSave: true });
  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
