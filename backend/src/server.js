import { connectDb } from './config/db.js';
import app from './app.js';
import { config } from './config/index.js';

await connectDb();

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
