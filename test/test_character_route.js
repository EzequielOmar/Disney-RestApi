let chai = require("chai");
let chaiHttp = require("chai-http");
const expect = require("chai").expect;
const assert = require("chai").assert;
const fs = require("fs");
const faker = require("faker");
chai.use(chaiHttp);
const url = process.env.HOST;
const testImage = "./test/test-image.jpeg";

//*mockup of character model
const Character = require("../models").Characters;

xdescribe("GET on /characters and /characters/:id :", () => {
  beforeEach(() => Character.destroy({ truncate: true }));

  it("Should return an empty list.", (done) => {
    chai
      .request(url)
      .get("/characters")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array").that.is.empty;
        done();
      });
  });

  it("Should return an existing character.", (done) => {
    const charTest = {
      name: faker.name.findName(),
      story: faker.hacker.phrase().slice(0, 123),
    };
    //* Create previous character with repeated name.
    Character.create(charTest).then((char) => {
      chai
        .request(url)
        .get("/characters/" + char.dataValues.id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          assert.equal(charTest.name, res.body.data.name);
          done();
        });
    });
  });

  it("Should fail on return a non existing character.", (done) => {
    chai
      .request(url)
      .get(
        "/characters/" +
          parseInt(Math.floor(Math.random() * -(1 - 200 + 1) + 1))
      )
      .end(function (err, res) {
        expect(res).to.have.status(500);
        assert.equal(
          res.body.error,
          "ID does not belong to existing character."
        );
        done();
      });
  });
});

xdescribe("POST on /characters : ", () => {
  beforeEach(() => Character.destroy({ truncate: true }));

  it("Should insert a character with all the correct values.", (done) => {
    const charTest = {
      name: faker.name.findName(),
      age: parseInt(Math.floor(Math.random() * -(1 - 200 + 1) + 1)),
      weight: parseFloat(Math.random() * -(1 - 200 + 1) + 1, 2).toFixed(2),
      story: faker.hacker.phrase().slice(0, 123),
    };
    chai
      .request(url)
      .post("/characters")
      .field("Content-Type", "multipart/form-data")
      .field(charTest)
      .attach("image", fs.readFileSync(testImage), "test-image.jpeg")
      .end(function (err, res) {
        expect(res).to.have.status(201);
        assert.equal(res.body.message, "Character created.");
        expect(res.body.data.image).to.be.not.null;
        assert.equal(res.body.data.name, charTest.name);
        assert.equal(res.body.data.age, charTest.age);
        assert.equal(res.body.data.weight, charTest.weight);
        assert.equal(res.body.data.story, charTest.story);
        done();
      });
  });

  it("Should fail by NOT UNIQUE character name.", (done) => {
    const charTest = {
      name: faker.name.findName(),
      story: faker.hacker.phrase().slice(0, 123),
    };
    //* Create previous character with repeated name.
    Character.create(charTest).finally(() => {
      chai
        .request(url)
        .post("/characters")
        .field("Content-Type", "multipart/form-data")
        .field(charTest)
        .end(function (err, res) {
          expect(res).to.have.status(500);
          expect(res.body.error.parent.code).to.be.equal("ER_DUP_ENTRY");
          done();
        });
    });
  });

  it("Should fail by MISSING VALUES.", (done) => {
    chai
      .request(url)
      .post("/characters")
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body.error.parent.code).to.be.equal(
          "ER_NO_DEFAULT_FOR_FIELD"
        );
        done();
      });
  });
});

xdescribe("PATCH on /characters/:id : ", () => {
  beforeEach(() => Character.destroy({ truncate: true }));

  it("Should modify character values with correct passed ones.", (done) => {
    const charTest = {
      name: faker.name.findName(),
      story: faker.hacker.phrase().slice(0, 123),
    };
    //* instert the test character
    Character.create(charTest).then((char) => {
      chai
        .request(url)
        .patch("/characters/" + char.dataValues.id)
        .send({
          story: faker.hacker.phrase().slice(0, 123),
        })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Character modified.");
          done();
        });
    });
  });

  it("Should not modify character if pass incorrect values.", (done) => {
    const charTest = {
      name: faker.name.findName(),
      story: faker.hacker.phrase().slice(0, 123),
    };
    //* instert the test character
    Character.create(charTest).then((char) => {
      chai
        .request(url)
        .patch("/characters/" + char.dataValues.id)
        .send({ fake: "fakeValue", fake2: "fakeValue2" })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Character not modified.");
          done();
        });
    });
  });

  it("Should fail if ID does not belong to existing character.", (done) => {
    chai
      .request(url)
      .patch(
        "/characters/" +
          parseInt(Math.floor(Math.random() * -(1 - 200 + 1) + 1))
      )
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body.error).to.be.equal(
          "ID does not belong to existing character."
        );
        done();
      });
  });
});

xdescribe("DELETE on /characters/:id : ", () => {
  beforeEach(() => Character.destroy({ truncate: true }));

  it("Should delete an existing character.", (done) => {
    const charTest = {
      name: faker.name.findName(),
      story: faker.hacker.phrase().slice(0, 123),
    };
    //* instert the test character
    Character.create(charTest).then((char) => {
      chai
        .request(url)
        .delete("/characters/" + char.dataValues.id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          assert.equal(res.body.message, "Character deleted.");
          done();
        });
    });
  });

  it("Should fail if ID does not belong to existing character.", (done) => {
    chai
      .request(url)
      .delete(
        "/characters/" +
          parseInt(Math.floor(Math.random() * -(1 - 200 + 1) + 1))
      )
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body.error).to.be.equal(
          "ID does not belong to existing character."
        );
        done();
      });
  });
});
