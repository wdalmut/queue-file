const fs = require('fs');
const ls = require('ls-stat');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function(basepath, callback) {
  mkdirp(basepath, (err) => {
    if (err) {
      return callback(err, undefined);
    }

    ls(basepath).then((files) => {
      let queue = files
        .filter((file) => file.isFile())
        .map((file) => path.join(basepath, file.filename));

      function commit(filename) {
        return function(callback) {
          fs.unlink(filename, callback);
        };
      }

      function rollback(filename) {
        return function(callback) {
          queue = queue.concat([filename]);
          callback();
        };
      }

      return callback(undefined, {
        push: function(data, callback) {
          let filename = path.join(basepath, new Date().getTime().toString() + Math.random().toString());
          fs.writeFile(filename, JSON.stringify(data), (err) => {
            if (err) {
              return callback(err, undefined);
            }

            queue = queue.concat([filename]);

            callback(undefined, filename);
          });
        },
        pop: function pop(callback) {
          return (function next() {

            if (!queue.length) {
              return setTimeout(next, 1000);
            }

            let filename = queue[0];
            queue = queue.slice(1);

            fs.readFile(filename, (err, data) => {
              if (err)  {
                rollback(filename);
                return setTimeout(next, 1000);
              }

              callback(JSON.parse(data), next, commit(filename), rollback(filename));
            });
          })();
        },
      });
    }).fail((err) => {
      callback(err, undefined);
    });
  });
};
