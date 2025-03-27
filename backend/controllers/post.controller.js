import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!text && !img)
      return res.status(400).json({ message: "Please provide text or image" });
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== userId)
      return res.status(403).json({ message: "You can't delete this post" });
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id.toString();
    if (!text) return res.status(400).json({ message: "Please provide text" });
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    const newComment = { user: userId, text };
    post.comments.push(newComment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) return res.status(200).json([]);
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });
    if (likedPosts.length === 0) return res.status(404).json([]);
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const followingPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });
    if (followingPosts.length === 0) return res.status(404).json([]);
    res.status(200).json(followingPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });
    if (userPosts.length === 0) return res.status(404).json([]);
    res.status(200).json(userPosts);
  } catch (error) {
    console.log("Error in getUserPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
