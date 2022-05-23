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
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2NTMzMzgxMzh9.O7tgmEyDbe0lkSDhulFU3lIKVkjIMMs3-uIGM5334dA",
  expired_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2NTMzMjUyMTIsImV4cCI6MTY1MzMyNTIxM30.WYDWli2lYwRYbrO1jyf3Zi7dtG5dEJI82zdD2vY7AsY";

//*mockup of movie model
const Movie = require("../models").Movies;

describe("GET on /movies and /movies/:id :", () => {
  it("Should return a list with two (2) movies", (done) => {
    chai
      .request(url)
      .get("/movies")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an("array").of.length(2);
        done();
      });
  });

  it("Should return an existing movie with id:1", (done) => {
    chai
      .request(url)
      .get("/movies/1")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        assert.equal(res.body.data.title, "Tom & Jerry Adventures");
        done();
      });
  });

  it("Should fail on return a non existing movie", (done) => {
    chai
      .request(url)
      .get("/movies/" + 3)
      .end(function (err, res) {
        expect(res).to.have.status(404);
        assert.equal(res.body.error, "ID does not belong to existing movie");
        done();
      });
  });
});

describe("POST on /movies : ", () => {
  it("Should insert a movie with all the correct values", (done) => {
    const prodTest = {
      title: faker.name.findName(),
      //* Return an date formated in rfc2822
      creation: "2012-11-13",
    };
    chai
      .request(url)
      .post("/movies")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .field(prodTest)
      .attach("image", fs.readFileSync(testImage), "test-image.jpeg")
      .end(function (err, res) {
        expect(res).to.have.status(201);
        assert.equal(res.body.message, "Movie created");
        expect(res.body.data.image).to.be.not.null;
        assert.equal(res.body.data.title, prodTest.title);
        //* Database store and return date in yyy-mm-dd format
        expect(res.body.data.creation).to.be.not.null;
        done();
      });
  });

  it("Should fail by NOT UNIQUE movie title", (done) => {
    const prodTest = {
      title: "Tom & Jerry Adventures",
      creation: "2012-11-13",
    };
    chai
      .request(url)
      .post("/movies")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .field(prodTest)
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body.error.parent.code).to.be.equal("ER_DUP_ENTRY");
        done();
      });
  });

  it("Should fail by MISSING VALUES", (done) => {
    chai
      .request(url)
      .post("/movies")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body.error).to.be.not.null;
        done();
      });
  });
});

describe("PATCH on /movies/:id: ", () => {
  it("Should modify id:2 movie values with correct passed ones", (done) => {
    chai
      .request(url)
      .patch("/movies/2")
      .set({ Authorization: `Bearer ${valid_token}` })
      .send({
        creation: "1985-01-14",
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Movie modified");
        done();
      });
  });

  it("Should not modify movie title value", (done) => {
    chai
      .request(url)
      .patch("/movies/1")
      .set({ Authorization: `Bearer ${valid_token}` })
      .send({
        title: "Cant change title",
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body.message).to.be.equal("Movie not modified");
        done();
      });
  });

  it("Should fail if ID does not belong to existing movie", (done) => {
    chai
      .request(url)
      .patch("/movies/40")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal(
          "ID does not belong to existing movie"
        );
        done();
      });
  });
});

describe("DELETE on /movies/:id: ", () => {
  it("Should delete an existing movie id:2", (done) => {
    chai
      .request(url)
      .delete("/movies/2")
      .set({ Authorization: `Bearer ${valid_token}` })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        assert.equal(res.body.message, "Movie deleted");
        done();
      });
  });

  it("Should fail if ID does not belong to existing movie", (done) => {
    chai
      .request(url)
      .delete("/movies/21")
      .set({ Authorization: `Bearer ${valid_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(404);
        expect(res.body.error).to.be.equal(
          "ID does not belong to existing movie"
        );
        done();
      });
  });
});
