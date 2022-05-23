let chai = require("chai");
const expect = require("chai").expect;
const assert = require("chai").assert;
const fs = require("fs");
let chaiHttp = require("chai-http");
const faker = require("faker");
chai.use(chaiHttp);

//vars
const url = "http://localhost:8080";
const testImage = "./test/test-image.jpeg";
const valid_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2NTMzMzgxMzh9.O7tgmEyDbe0lkSDhulFU3lIKVkjIMMs3-uIGM5334dA";

//*mockup of character model
const Character = require("../models").Characters;

describe("GET on /characters and /characters/:id :", () => {
  it("Should return a list with three (3) characters", (done) => {
    chai
      .request(url)
      .get("/characters")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array").of.length(3);
        done();
      });
  });

  it("Should return an existing character", (done) => {
    chai
      .request(url)
      .get("/characters/1")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        assert.equal(res.body.data.name, "Tom");
        done();
      });
  });

  it("Should fail on return a non existing character", (done) => {
    chai
      .request(url)
      .get("/characters/21")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        assert.equal(
          res.body.error,
          "ID does not belong to existing character"
        );
        done();
      });
  });
});

describe("POST on /characters : ", () => {
  it("Should insert a character with all the correct values", (done) => {
    const charTest = {
      name: faker.name.findName(),
      age: parseInt(Math.floor(Math.random() * -(1 - 200 + 1) + 1)),
      weight: parseFloat(Math.random() * -(1 - 200 + 1) + 1, 2).toFixed(2),
      story: faker.hacker.phrase().slice(0, 123),
    };
    chai
      .request(url)
      .post("/characters")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .field(charTest)
      .attach("image", fs.readFileSync(testImage), "test-image.jpeg")
      .end(function (err, res) {
        expect(res).to.have.status(201);
        assert.equal(res.body.message, "Character created");
        expect(res.body.data.image).to.be.not.null;
        assert.equal(res.body.data.name, charTest.name);
        assert.equal(res.body.data.age, charTest.age);
        assert.equal(res.body.data.weight, charTest.weight);
        assert.equal(res.body.data.story, charTest.story);
        done();
      });
  });

  it("Should fail by NOT UNIQUE character name", (done) => {
    chai
      .request(url)
      .post("/characters")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .field({
        name: "Tom",
        age: parseInt(Math.floor(Math.random() * -(1 - 200 + 1) + 1)),
        weight: parseFloat(Math.random() * -(1 - 200 + 1) + 1, 2).toFixed(2),
      })
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body.error.parent.code).to.be.equal("ER_DUP_ENTRY");
        done();
      });
  });

  it("Should fail by MISSING VALUES", (done) => {
    chai
      .request(url)
      .post("/characters")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body.error).to.be.not.null;
        done();
      });
  });
});

describe("PATCH on /characters/:id : ", () => {
  it("Should modify character values with correct passed ones", (done) => {
    chai
      .request(url)
      .patch("/characters/1")
      .set({ Authorization: `Bearer ${valid_token}` })
      .send({
        story: faker.hacker.phrase().slice(0, 123),
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Character modified");
        done();
      });
  });

  it("Should not modify when passing invalid values", (done) => {
    chai
      .request(url)
      .patch("/characters/1")
      .set({ Authorization: `Bearer ${valid_token}` })
      .send({ invalid: "invalid value" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Character not modified");
        done();
      });
  });

  it("Should fail if ID does not belong to existing character", (done) => {
    chai
      .request(url)
      .patch("/characters/45")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal(
          "ID does not belong to existing character"
        );
        done();
      });
  });
});

describe("DELETE on /characters/:id : ", () => {
  it("Should delete an existing character", (done) => {
    chai
      .request(url)
      .delete("/characters/3")
      .set({ Authorization: `Bearer ${valid_token}` })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        assert.equal(res.body.message, "Character deleted");
        done();
      });
  });

  it("Should fail if ID does not belong to existing character", (done) => {
    chai
      .request(url)
      .delete("/characters/45")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal(
          "ID does not belong to existing character"
        );
        done();
      });
  });
});
