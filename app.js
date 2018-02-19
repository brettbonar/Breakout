const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use("/lib", express.static("node_modules"));

app.listen(80, () => {});
