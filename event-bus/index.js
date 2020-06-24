const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

const events = [];
const log = (...args) => console.log('EventBus: ', ...args);

app.post('/events', async (req, res, next) => {
  const event = req.body;
  log(`Receive event ${event.type}`);
  events.push(event);

  try {
    const services = [
      'posts-clusterip-srv:4000',
      'messages-clusterip-serv:4001',
      'query-clusterip-srv:4002',
      'moderation-clusterip-srv:4003',
    ];
    
    const requests = services.map((service) =>
      axios.post(`http://${service}/events`, event)
    );

    await Promise.all(requests);

    res.status(201).json({ success: true });
  } catch (e) {
    // status 400
    res.json({
      success: false,
      error: e.message,
    });
    next();
  }
});

app.get('/events', (req, res) => {
  res.json(events);
});

const port = 4005;
app.listen(port, () => console.log(`Event bus started on port ${port}`));
