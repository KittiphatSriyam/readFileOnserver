const fs = require("fs");
const mime = require("mime-types");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { RedisConnection } = require("./redis");
const server =
  "\\\\192.168.35.39/e$/THTPROD/WebSite/HR/Training/MANUAL_TRAINING";

exports.getTiltleManual = ({ ROOT_DIR, YEAR }) => {
  return new Promise((resolve, reject) => {
    const url = `${server}/${ROOT_DIR}/${YEAR}`;
    try {
      resolve(fs.readdirSync(url));
    } catch (error) {
      console.log("error->>", error);
      resolve([]);
    }
  });
};

exports.checkDirYear = ({ ROOT_DIR }) => {
  return new Promise((resolve, reject) => {
    const url = `${server}/${ROOT_DIR}/`;
    try {
      resolve(fs.readdirSync(url));
    } catch (error) {
      console.log("error->>", error);
      resolve([]);
    }
  });
};
const getSubTiltleManual = ({ ROOT_DIR, YEAR }, titleManual) => {
  return new Promise((resolve, reject) => {
    const url = `${server}/${ROOT_DIR}/${YEAR}/${titleManual}`;
    try {
      resolve(fs.readdirSync(url));
    } catch (error) {
      console.log("error->>", error);
      resolve([]);
    }
  });
};
const getFileNameSever = ({ ROOT_DIR, YEAR }, titleManual, subTitleManual) => {
  return new Promise((resolve, reject) => {
    const url = `${server}/${ROOT_DIR}/${YEAR}/${titleManual}/${subTitleManual}`;
    try {
      resolve(fs.readdirSync(url));
    } catch (error) {
      console.log("error->>", error);
      resolve([]);
    }
  });
};

const genTitle = (title) => {
  return new Promise((resolve, reject) => {
    let html = `<tr bgcolor="ffffff">
                  <td id="contentData1" colspan=4 style='color:#ef7d00;font-size:14px;'>
                      <b> ${title}
                      </b>
                  </td>
                </tr>
                `;
    resolve(html);
  });
};
const genSubTitle = (subTitle) => {
  return new Promise((resolve, reject) => {
    let html = `<tr bgcolor='f1f1f1'>
                    <td id='contentData' align=center><b>
                        <font style='font-size:12px;'></font>
                        &nbsp;&nbsp;${subTitle}
                      </b></td>
                    <td id='contentData4' width='10%' align=center><b>Size</b></td>
                    <td id='contentData4' width='17%' align=center><b>Update Date</b></td>
                    <td id='contentData4' align=center><b>Extension</b></td>
                  </tr>
                  `;
    resolve(html);
  });
};

const getLabelExtension = (type) => {
  return new Promise((resolve, reject) => {
    let label = "";
    switch (type) {
      case "png":
        label = "warning";
        break;
      case "pdf":
        label = "deleted";
        break;
      case "pptx":
        label = "warning";
        break;
      case ("xls", "xlsx"):
        label = "new";
        break;
      case ("doc", "docx"):
        label = "docx";
        break;
      default:
        label = "new";
    }
    resolve(label);
  });
};

const genContent = (mimeType, lastUpdate, size, path, file) => {
  return new Promise(async (resolve, reject) => {
    const type = mime.extension(mimeType);
    const label = await getLabelExtension(type.toLowerCase());
    let uuid = uuidv4();
    let path_html = "";
    lastUpdate = moment(lastUpdate).format("DD/MM/YYYY HH:mm A");

    let key = await RedisConnection.getAllKey();

    if (key.length == 0) {
      path_html = uuid;
      await RedisConnection.setValue(uuid, path);
    } else {
      for (let i in key) {
        let findPath = await RedisConnection.getValue(key[i]);
        if (findPath == path) {
          path_html = key[i];
          break;
        }
        if (key.length - 1 == i) {
          path_html = uuid;
          await RedisConnection.setValue(uuid, path);
        }
      }
    }

    let html = `<tr bgcolor=#ffffff>
            <td id=contentDataSec>
              <a href="http://192.168.37.59:9000/getFileServer/${path_html}" target="_blank">
                  <li>${file}</li>
              </a>
            </td>
            <td id=contentData2> ${size} KB </td>
            <td id=contentData2>${lastUpdate}</td>
            <td id=contentData2><span class='label label-${label}'>${type.toUpperCase()}</span></td>
          </tr>
          `;
    resolve(html);
  });
};

exports.genManualHtml = (titleManual, { ROOT_DIR, YEAR }) => {
  return new Promise(async (resolve, reject) => {
    var html = "";
    let fileName = [];

    for (let no in titleManual) {
      html += await genTitle(titleManual[no]);
      const subTitle = await getSubTiltleManual(
        { ROOT_DIR, YEAR },
        titleManual[no]
      );
      for (let id in subTitle) {
        html += await genSubTitle(subTitle[id]);
        fileName = await getFileNameSever(
          { ROOT_DIR, YEAR },
          titleManual[no],
          subTitle[id]
        );
        if (fileName) {
          fileName = fileName.filter(
            (file) => file.trim().toLowerCase() != "thumbs.db"
          );

          for (let i in fileName) {
            if (fileName[i].split(".").length == 1) {
              fileName.splice(i, 1);
            }
          }

          for (let i in fileName) {
            let path = `/${ROOT_DIR}/${YEAR}/${titleManual[no]}/${subTitle[id]}/${fileName[i]}`;

            let mimeType = mime.lookup(`${server}/${path}`);
            let detail = fs.statSync(`${server}/${path}`);
            let time = detail.mtime;
            let size = Math.ceil(detail.size / 1024);
            html += await genContent(
              mimeType,
              time,
              size,
              path,
              fileName[i].split(".")[0]
            );
          }
        }
      }
    }

    resolve(html);
  });
};
