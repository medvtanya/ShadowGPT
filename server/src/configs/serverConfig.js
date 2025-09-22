const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const corsConfig = require('./corsConfig');

const serverConfig = (app) => {
  app.use(cors(corsConfig)); 

  app.use(morgan('dev'));

  app.use(express.urlencoded({ extended: true }));

  app.use(express.json());

  app.use(express.static('public'));

};

module.exports = serverConfig;