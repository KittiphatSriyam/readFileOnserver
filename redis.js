const redis = require("redis");
const client = redis.createClient();

class RedisConnection {
  constructor() {
    client.on("error", function (error) {
      console.log(error);
    });
  }
  setValue(key, value) {
    return new Promise((resolve, reject) => {
      client.set(key, value, function (err) {
        if (err) {
          console.log(err);
          throw err;
        }
        resolve(200);
      });
    });
  }
  getValue(key) {
    return new Promise((resolve, reject) => {
      client.get(key, function (err, value) {
        if (err) throw err;
        resolve(value);
      });
    });
  }
  getAllKey() {
    return new Promise((resolve, reject) => {
      client.keys("*", function (err, keys) {
        if (err) return console.log(err);
        resolve(keys);
      });
    });
  }
}

module.exports = {
  RedisConnection: new RedisConnection(),
};
