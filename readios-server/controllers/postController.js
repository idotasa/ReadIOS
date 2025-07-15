// controllers/postController.js

// בדוגמה זו — נתונים סטטיים לדמו בלבד
let posts = [
  {
    _id: '1',
    userId: 'u1',
    groupId: 'g1',
    title: "המלצה: הארי פוטר",
    content: "ספר קסום ומיוחד. ממליץ מאוד!",
    type: "image+text",
    url: "https://picsum.photos/seed/harry/400/200",
    likes: ["u2"],
    comments: [
      { userId: { username: "משתמש1" }, content: "גם אני אהבתי!", createdAt: new Date() }
    ],
    createdAt: new Date(),
    author: { username: "booklover21" }
  }
];

// יצירת פוסט חדש
exports.createPost = async (req, res) => {
  const { userId, groupId, title, content, type, url } = req.body;
  const newPost = {
    _id: (posts.length + 1).toString(),
    userId,
    groupId,
    title,
    content,
    type,
    url,
    likes: [],
    comments: [],
    createdAt: new Date()
  };
  posts.push(newPost);
  res.status(201).json(newPost);
};

// מחיקת פוסט לפי id
exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const index = posts.findIndex(p => p._id === postId);
  if (index === -1) return res.status(404).json({ error: "Post not found" });
  posts.splice(index, 1);
  res.json({ message: `Post ${postId} deleted` });
};

// הוספת תגובה לפוסט
exports.addComment = async (req, res) => {
  const postId = req.params.id;
  const { userId, username, content } = req.body;
  const post = posts.find(p => p._id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const newComment = {
    userId: { username },
    content,
    createdAt: new Date()
  };
  post.comments.push(newComment);
  res.status(201).json(newComment);
};

// לייק/אנלייק לפוסט
exports.toggleLike = async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId || 'u1'; // לצורך הדוגמה, משתמש סטטי
  const post = posts.find(p => p._id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const index = post.likes.indexOf(userId);
  if (index === -1) {
    post.likes.push(userId);
    res.json({ message: "Liked", likesCount: post.likes.length });
  } else {
    post.likes.splice(index, 1);
    res.json({ message: "Unliked", likesCount: post.likes.length });
  }
};

// עדכון תמונה (url) בפוסט (רק הבעלים)
exports.updateImage = async (req, res) => {
  const postId = req.params.id;
  const { userId, url } = req.body;
  const post = posts.find(p => p._id === postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.userId !== userId) return res.status(403).json({ error: "Not authorized" });

  post.url = url;
  res.json({ message: "Image updated", post });
};

// חיפוש פוסטים (לפי user, group או בלי פרמטרים)
exports.searchPosts = async (req, res) => {
  const { user, group } = req.query;
  let filteredPosts = posts;

  if (user) filteredPosts = filteredPosts.filter(p => p.userId === user);
  if (group) filteredPosts = filteredPosts.filter(p => p.groupId === group);

  res.json(filteredPosts);
};
