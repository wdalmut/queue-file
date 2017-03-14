# Queue

[![Build Status](https://travis-ci.org/wdalmut/queue-file.svg?branch=master)](https://travis-ci.org/wdalmut/queue-file)

Just a simple queue based on files

```sh
$ npm install queue-file --save
```

```js
require('queue-file')("/tmp/queue", (err, queue) => {
  if (err) {
    // on error
  }

  data.pop((data, next, commit, rollback) => {
    /* work with data */

    // confirm executed and get the next message
    commit(next);

    /** rollback(next); // keep the message and get the next message */
  });

  data.push({test: ok}, (err, filename) => {
    // sent
  });
});
```

