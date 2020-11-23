const fs = require("fs");
const mime = require("mime-types");
const { RedisConnection } = require("./redis");
const server =
  "\\\\192.168.35.39/e$/THTPROD/WebSite/HR/Training/MANUAL_TRAINING";

exports.getFileFromServer = (url) => {
  return new Promise(async (resolve, reject) => {
    url = await RedisConnection.getValue(url);
    const mimeType = mime.lookup(server + url);
    const data = fs.readFileSync(server + url);
    resolve({
      mimeType,
      data,
    });
  });
};
