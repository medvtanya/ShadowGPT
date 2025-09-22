const express = require("express");
const serverConfig = require("./configs/serverConfig");
const indexRouter = require("./routes/indexRouter");

const app = express();

serverConfig(app);

app.use("/api", indexRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
