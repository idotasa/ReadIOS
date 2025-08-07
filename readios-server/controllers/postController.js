const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');

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
      content: content || "",
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

    const userName = (await fetchUserById(userId)).username;
    const post = await fetchPostById(req.params.id);

    post.comments.push({ userId, userName, content });
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

    const likesAsStrings = post.likes.map(id => id.toString());

    const alreadyLiked = likesAsStrings.includes(userId);

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


exports.getFeedForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friendIds = user.friends.map(id => id.toString());
    const groupIds = user.groups.map(id => id.toString());

    // groups
    const groupPosts = await Post.find({
      groupId: { $in: groupIds }
    })
      .populate('userId', 'username profileImage')
      .populate('groupId', 'name image')
      .lean();

    const groupPostIds = new Set(groupPosts.map(p => p._id.toString()));

    // other friends
    const friendPosts = await Post.find({
      groupId: { $exists: false },
      userId: { $in: friendIds }
    })
      .populate('userId', 'username profileImage')
      .lean();

    // user posts
    const userPosts = await Post.find({ userId })
      .populate('userId', 'username profileImage')
      .populate('groupId', 'name image')
      .lean();

    // validate and remove 
    const allPostsMap = new Map();
    [...groupPosts, ...friendPosts, ...userPosts].forEach(post => {
      allPostsMap.set(post._id.toString(), post);
    });

    const uniquePosts = Array.from(allPostsMap.values());

    // מיין מהחדש לישן
    uniquePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ posts: uniquePosts });
  } catch (err) {
    console.error('❌ Failed to load feed:', err.message);
    res.status(500).json({ error: 'Failed to load feed', details: err.message });
  }
};


exports.getFeedForGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId).lean();
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const groupPosts = await Post.find({ groupId: groupId })
      .populate('userId', 'username profileImage')
      .populate('groupId', 'name image')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ posts: groupPosts });

  } catch (err) {
    console.error('❌ Failed to load group feed:', err.message);
    res.status(500).json({ error: 'Failed to load group feed', details: err.message });
  }
};


exports.getPostCountsByType = async (req, res) => {
  try {
    const counts = await Post.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1
        }
      }
    ]);

    res.json(counts);
  } catch (err) {
    console.error('Error in getPostCountsByType:', err);
    res.status(500).json({ error: 'שגיאה בסטטיסטיקת סוגי פוסטים' });
  }
};




