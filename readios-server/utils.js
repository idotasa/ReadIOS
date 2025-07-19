const User = require('./models/User');
const Post = require('./models/Post');

exports.fetchUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

exports.fetchPostById = async (id) => {
  const post = await Post.findById(id);
  if (!post) throw new Error('Post not found');
  return post;
};