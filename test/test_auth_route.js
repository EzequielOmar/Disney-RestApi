let chai = require("chai");
const expect = require("chai").expect;
const assert = require("chai").assert;
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

//vars
const url = "http://localhost:8080";
const expired_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2NTMzMjUyMTIsImV4cCI6MTY1MzMyNTIxM30.WYDWli2lYwRYbrO1jyf3Zi7dtG5dEJI82zdD2vY7AsY";

describe("POST on /signup :", () => {
  it("Should register a new user", (done) => {
    chai
      .request(url)
      .post("/auth/signup")
      .send({
        email: "teest@gmail.com",
        pass: "testing",
        pass_repeat: "testing",
      })
      .end(function (err, res) {
        expect(res).to.have.status(201);
        assert.equal(res.body.message, "User created");
        done();
      });
  });

  it("Should fail by NON AVAILABLE email", (done) => {
    chai
      .request(url)
      .post("/auth/signup")
      .send({
        email: "teest@gmail.com",
        pass: "testing",
        pass_repeat: "testing",
      })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        assert.equal(res.body.error, "Email is being used");
        done();
      });
  });
});

describe("POST on /login :", () => {
  it("Should login an existing user", (done) => {
    chai
      .request(url)
      .post("/auth/login")
      .send({ email: "test@gmail.com", pass: "testing" })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        assert.equal(res.body.message, "User logged correctly");
        done();
      });
  });

  it("Should fail by NON EXISTING user", (done) => {
    chai
      .request(url)
      .post("/auth/login")
      .send({ email: "nonexists@gmail.com", pass: "1234567" })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        assert.equal(res.body.error, "Invalid email");
        done();
      });
  });
});

describe("POST on /movies (testing auth middleware) :", () => {
  it("Should fail by NON EXISTING token", (done) => {
    chai
      .request(url)
      .post("/characters")
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(401);
        assert.equal(res.body.error, "Token not found");
        done();
      });
  });

  it("Should fail by TOKEN EXPIRED", (done) => {
    chai
      .request(url)
      .post("/characters")
      .set({ Authorization: `Bearer ${expired_token}` })
      .field("Content-Type", "multipart/form-data")
      .end(function (err, res) {
        expect(res).to.have.status(401);
        assert.equal(res.body.error, "Token expired, please login again");
        done();
      });
  });
});
