require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const clubsRouter = require('./clubs/clubs-router');
const clubCommentsRouter = require('./club-comments/club-comments-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
}));
app.use(helmet());
app.use(cors());

app.use('/api/clubs', clubsRouter);
app.use('/api/club-comments', clubCommentsRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!')
});

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        console.log(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response);
});

module.exports = app;