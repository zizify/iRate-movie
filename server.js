'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { router: usersRouter } = require('./users');
const { router: authRouter, basicStrategy, jwtStrategy } = require('./auth');
const { PORT, DATABASE_URL } = require('./config');
const jwtAuth = passport.authenticate('jwt', { session: false });

const app = express();

passport.use(basicStrategy);
passport.use(jwtStrategy);

app.use(morgan('common', { skip: () => process.env.NODE_ENV === 'test' }));
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({ data: 'rosebud' });
});


/**
 * REMOVE FOR CAPSTONE (START)
 */
const uuid = require('uuid');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const Items = {
  create: function (name) {
    const item = {
      name: name,
      id: uuid.v4()
    };
    console.log(item);
    this.items[item.id] = item;
    return item;
  },
  getAll: function () {
    return Object.keys(this.items).map(key => this.items[key]);
  },
  getOne: function (id) {
    return this.items[id];
  },
  update: function (updatedItem) {
    const { id } = updatedItem;
    if (!(id in this.items)) {
      throw StorageException(
        `Can't update item \`${id}\` because doesn't exist.`);
    }
    this.items[updatedItem.id] = updatedItem;
    return updatedItem;
  },
  delete: function (id) {
    delete this.items[id];
  },
  items: {}
};

Items.create('aaa');
Items.create('bbb');
Items.create('ccc');
Items.create('ddd');
Items.create('eee');
Items.create('fff');

app.get('/api/items', (req, res) => {
  return res.json(Items.getAll());
});

app.post('/api/items', jwtAuth, jsonParser, (req, res) => {

  return res.status(201).json(Items.create(req.body.name));
});

app.get('/api/items/:id', (req, res) => {
  return res.json(Items.getOne(req.params.id));
});

app.put('/api/items/:id', jwtAuth, jsonParser, (req, res) => {
  return res.json(Items.update(req.body));
});

app.delete('/api/items/:id', jwtAuth, (req, res) => {
  Items.delete(req.params.id);
  return res.sendStatus(204);
});

/**
 * REMOVE FOR CAPSTONE (END)
 */


app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;
function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
