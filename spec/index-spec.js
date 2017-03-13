const queue = require('../');
const mock = require('mock-fs');

describe("Queue", () => {
  describe("get", () => {
    beforeEach(() => {
      mock({
        "/basepath": {
          "01": '{"test": true}',
          "02": '{"file": "02"}',
        }
      });
    });

    afterEach(mock.restore);

    it("should get an existing message", (done) => {
      queue("/basepath", (err, data) => {
        data.pop(function(data, next, commit, rollback) {
          expect(data).toEqual({test: true});
          done();
        });
      });
    });

    it("should get multiple messages", (done) => {
      queue("/basepath", (err, data) => {
        let i=0;
        data.pop(function(data, next, commit, rollback) {
          i+=1;

          if (i==2) {
            expect(data).toEqual({file: "02"});
            done();
          } else {
            next();
          }
        });
      });
    });
  });

  describe("push", () => {
    beforeEach(() => {
      mock({});
    });

    afterEach(mock.restore);

    it("should create", (done) => {
      queue("/basepath", (err, _) => {
        expect(typeof _).toEqual("object");
        done();
      });
    });

    it("should push new messages", (done) => {
      queue("/basepath", (err, _) => {
        _.push({"test": true}, done);
      });
    });
  });

  describe("get/push", () => {
    beforeEach(() => {
      mock({});
    });

    afterEach(mock.restore);

    it("should create", (done) => {
      queue("/basepath", (err, _) => {
        _.pop(function(data, next, commit, rollback) {
          expect(data.test).toBe(true);
          done();
        });

        _.push({"test": true}, () => {});
      });
    });
  });

  describe("commit", () => {
    beforeEach(() => {
      mock({
        "/basepath": {
          "01": '{"test": true}',
        },
      });
    });

    afterEach(mock.restore);

    it("should create", (done) => {
      queue("/basepath", (err, _) => {
        _.pop(function(data, next, commit, rollback) {
          expect(data.test).toBe(true);
          commit(done);
        });
      });
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      mock({
        "/basepath": {
          "01": '{"test": true}',
        },
      });
    });

    afterEach(mock.restore);

    it("should create", (done) => {
      queue("/basepath", (err, _) => {
        _.pop(function(data, next, commit, rollback) {
          expect(data.test).toBe(true);
          rollback();

          _.pop(function(data, next, commit, rollback) {
            expect(data.test).toBe(true);
            commit(done);
          });
        });
      });
    });
  });
});
