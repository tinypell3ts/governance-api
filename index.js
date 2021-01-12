const express = require("express");
const apiRouter = require("./router");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

require("dotenv").config();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", apiRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
