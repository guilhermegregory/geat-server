require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.test' });

const app = require('./app');

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => {
  console.log(`Server listening in port ${serverPort}`);
});
