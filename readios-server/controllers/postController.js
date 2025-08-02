const Post = require('../models/Post');
const { fetchUserById, fetchPostById } = require('../utils');

exports.createPost = async (req, res) => {
  try {
    const { userId, groupId, title, content, type, url } = req.body;

    if (!userId || !title || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Todo: add group check
    await fetchUserById(userId);

    const post = new Post({
      userId,
      groupId: groupId || undefined,      
      title,
      content,
      type,
      url
    });
    
    const saved = await post.save();
    res.status(201).json({ message: 'Post created', post: saved });
  } catch (err) {
    console.error('❌ Error in createPost:', err);
    res.status(500).json({ message: 'Post creation failed', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await fetchPostById(req.params.id);
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ message: 'Missing userId or comment content' });
    }

    await fetchUserById(userId);
    const post = await fetchPostById(req.params.id);

    post.comments.push({ userId, content });
    await post.save();

    res.json({ message: 'Comment added', comments: post.comments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const post = await fetchPostById(req.params.id);

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: alreadyLiked ? 'Unliked' : 'Liked', likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: 'Like toggle failed', error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await fetchPostById(req.params.id);
    res.json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { user, group } = req.query;
    const filter = {};
    if (user) filter.userId = user;
    if (group) filter.groupId = group;

    const posts = await Post.find(filter);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};
