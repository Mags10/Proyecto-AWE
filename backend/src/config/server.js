const express = require('express');
const cors = require('cors');

const connectDB = require('./database');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.statusPath = '/api/status';
    this.ingredientsPath = '/api/ingredients';
    this.purchaseRecordsPath = '/api/purchase-records';

    this.middlewares();
    this.routes();
    connectDB();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  routes() {
    this.app.use('/api', require('../routes/docs.route'));
    this.app.use(this.statusPath, require('../routes/status.route'));
    this.app.use(this.ingredientsPath, require('../routes/ingredients.route'));
    this.app.use(this.purchaseRecordsPath, require('../routes/purchase-records.route'));

    this.app.get('/', (req, res) => {
      res.json({
        message: 'Hello World!',
        timestamp: new Date()
      });
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

module.exports = Server;
