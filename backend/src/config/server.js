const express = require('express');
const cors = require('cors');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.apiBasePaths = ['/api', '/awe/api'];

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  routes() {
    for (const apiBasePath of this.apiBasePaths) {
      this.app.use(apiBasePath, require('../routes/docs.route'));
      this.app.use(`${apiBasePath}/status`, require('../routes/status.route'));
      this.app.use(`${apiBasePath}/auth`, require('../routes/auth.route'));
      this.app.use(`${apiBasePath}/users`, require('../routes/users.route'));
      this.app.use(`${apiBasePath}/ingredients`, require('../routes/ingredients.route'));
      this.app.use(`${apiBasePath}/purchase-records`, require('../routes/purchase-records.route'));
      this.app.use(`${apiBasePath}/recipes`, require('../routes/recipes.route'));
      this.app.use(`${apiBasePath}/production-batches`, require('../routes/production-batches.route'));
      this.app.use(`${apiBasePath}/sales`, require('../routes/sales.route'));
      this.app.use(`${apiBasePath}/analytics`, require('../routes/analytics.route'));
    }

    this.app.get('/', (req, res) => {
      res.json({
        message: 'Hello World!',
        timestamp: new Date(),
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
