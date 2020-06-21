const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();

const commentsByPostId = {};
const defaultContent = {
  pending: 'Comment pending approval.',
  rejected: 'Comment was rejected. Fuck you!',
};
const STATUS = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
};

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

app.get('/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  res.send(commentsByPostId[id]) || [];
});

app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const { id: postId } = req.params;
  const commentId = randomBytes(4).toString('hex');

  const comments = commentsByPostId[postId] || [];
  comments.push({
    content,
    id: commentId,
    status: STATUS.PENDING,
  });
  commentsByPostId[postId] = comments;

  try {
    await axios.post('http://localhost:4005/events', {
      type: 'CommentCreated',
      data: {
        postId,
        content,
        id: commentId,
        status: STATUS.PENDING,
      },
    });

    res.status(201).send(comments);
  } catch (e) {
    res.status(400).json({
      message: e.message,
      endpoint: e.config.url,
    });
  }
});

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  console.log(`Received ${type} event.`);

  if (type === 'CommentModerated') {
    const { id, postId, status } = data;
    commentsByPostId[postId].find(
      (comment) => comment.id === id
    ).status = status;

    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data,
    });
  }

  res.json(req.body);
});

const port = 4001;
app.listen(port, () => {
  console.log(`CommentsService started on port ${port}`);
});
