const { env } = require('./src/config/env');
const { createApp } = require('./src/app');

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Backend runtime listening on port ${env.PORT}`);
});
