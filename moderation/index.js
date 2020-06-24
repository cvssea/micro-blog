const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const log = (...args) => console.log('ModerationService: ', ...args);

app.use(morgan('dev'));
app.use(bodyParser.json());

const STATUS = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
};

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  log(`Received event ${type}`);

  if (type === 'CommentCreated') {
    const status = data.content.toLowerCase().includes('orange')
      ? STATUS.REJECTED
      : STATUS.APPROVED;

    setTimeout(
      async () =>
        await axios.post('http://event-bus-srv:4005/events', {
          type: 'CommentModerated',
          data: {
            ...data,
            status,
          },
        }),
      Math.floor(Math.random() * 10000)
    );

    log('Set status', status);

    res.json({ message: 'Comment moderated', status });
  } else {
    res.end();
  }
});

const port = 4003;
app.listen(port, () => {
  log(`Server started on port ${port}`);
});
