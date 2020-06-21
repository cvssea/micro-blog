const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const log = (...args) => console.log('QueryService: ', ...args);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, postId, content, status } = data;
    const comment = posts[postId].comments.find((comment) => comment.id === id);

    comment.content = content;
    comment.status = status;
  }
};

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  log(`Received event ${type}`);

  handleEvent(type, data);
  res.status(201).json({ success: true, event: type });
});

const port = 4002;
app.listen(port, async () => {
  log(`Server started on port ${port}`);

  const { data } = await axios.get('http://localhost:4005/events');
  for (let event of data) {
    log(`Processing Event ${event.type}`);

    const { type, data } = event;
    handleEvent(type, data);
  }

  log(`Received events: ${data.length}`);
});
