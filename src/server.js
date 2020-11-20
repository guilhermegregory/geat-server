require('dotenv').config({ path: process.env.NODE_ENV === 'prod' ? '.env' : '.env.test' });

const app = require('./app');

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening in port ${process.env.SERVER_PORT}`);
});
