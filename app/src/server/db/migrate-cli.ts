import { getDb } from "./client";
import { runMigrations } from "./migrate";
import { logger } from "../lib/logger";

runMigrations(getDb())
  .then(() => {
    logger.info("migrations applied");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("migration failed", { error: String(err) });
    process.exit(1);
  });
