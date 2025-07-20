import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  // Check if channelId is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }
  // Check if user is already subscribed to the channel
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (existingSubscription) {
    // User is already subscribed, so unsubscribe
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed from channel successfully"));
  }
  // User is not subscribed, so subscribe
  const newSubscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newSubscription,
        "Subscribed to channel successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // Check if channelId is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }
  // Fetch subscribers of the channel
  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "name email")
    .select("subscriber createdAt");
  if (!subscribers || subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found for this channel");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // Check if subscriberId is valid
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID");
  }
  // Fetch channels to which the user has subscribed
  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "name description")
    .select("channel createdAt");
  if (!subscriptions || subscriptions.length === 0) {
    throw new ApiError(404, "No subscriptions found for this user");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
