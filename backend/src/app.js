require('dotenv').config();

const connectDB = require('./config/database');
const Server = require('./config/server');
const ensureDefaultUsers = require('./startup/ensure-default-users');

async function bootstrap() {
  await connectDB();
  await ensureDefaultUsers();

  const server = new Server();
  server.listen();
}

bootstrap().catch((error) => {
  console.log('Fatal bootstrap error:');
  console.log(error);
  process.exit(1);
});
