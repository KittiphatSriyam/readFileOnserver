const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { getTiltleManual, genManualHtml, checkDirYear } = require("./getManual");
const { getFileFromServer } = require("./getFileFromServer");
const cors = require("cors");
const port = process.env.PORT || 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.post("/manual", async (req, res) => {
  console.log("manual");
  const dirYear = await checkDirYear(req.body);
  if (!dirYear.includes(req.body.YEAR)) {
    res.send(500);
  } else {
    const titleManual = await getTiltleManual(req.body);
    const ManualHtml = await genManualHtml(titleManual, req.body);
    res.status(200).send(ManualHtml);
  }
});

app.get("/getFileServer/:path", async (req, res) => {
  console.log("getFileServer");
  const { path } = req.params;
  const file = await getFileFromServer(path);
  res.type(file.mimeType);
  res.send(file.data);
});

app.listen(port, () => {
  console.log(`server is : http://localhost:${port}`);
});
