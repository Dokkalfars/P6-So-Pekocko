const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); 


const app = express();

app.use(rateLimit({         
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(helmet());

app.use(cors({origin: 'http://localhost:4200'}));

const userRoutes = require('./routes/User');
const sauceRoutes = require('./routes/sauce');

require("dotenv").config();
const ID = process.env.ID;
const MDP = process.env.MDP;

mongoose.connect(`mongodb+srv://${ID}:${MDP}@cluster0.rdnbl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
useUnifiedTopology: true })
.then(() => console.log('connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));




app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  app.use(bodyParser.json());

  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/api/auth', userRoutes);
  app.use('/api/sauces/', sauceRoutes);

module.exports = app;

