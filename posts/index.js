const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const axios = require('axios');

const posts = {};

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = { id, title };

  try {
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'PostCreated',
      data: { id, title },
    });

    res.status(201).send(posts[id]);
  } catch (e) {
    res
      .status(400)
      .json({ error: { message: e.message, endPoint: e.config.url } });
  }
});

app.post('/events', (req, res) => {
  const event = req.body;
  console.log(`Received ${event.type} Event.`);
  res.json(event);
});

const port = 4000;
const revision = '0.0.3';
app.listen(port, () => {
  console.log(revision);
  console.log(`PostsService started on port ${port}.`);
});
