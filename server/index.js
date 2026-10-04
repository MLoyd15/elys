import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT || 4000);

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`NursePath API listening on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error(`Database startup failed: ${error.message}`);
    process.exitCode = 1;
  });
