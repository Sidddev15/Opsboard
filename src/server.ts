import { app } from "./app.js";
import { env } from "./lib/env.js";

app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`OpsBoard API running on http://localhost:${env.PORT}`);
});
