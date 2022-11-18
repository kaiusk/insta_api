import app from "../src/server";

const supertest = require("supertest");
const request = supertest(app);

let token = "";

beforeAll(async () => {
  const res = await request.post("/api/v1/users/login").send({
    username: "sigrimigri",
    password: "test",
  });
  token = res.body.token;
});

it("should get top users", async () => {
  const res = await request
    .get("/api/v1/stats/topusers")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
  expect(res.body).toBeInstanceOf(Array);
});

it("should get genders", async () => {
  const res = await request
    .get("/api/v1/stats/genders")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
  expect(res.body).toBeInstanceOf(Array);
});

it("should get users by added date", async () => {
  const res = await request
    .get("/api/v1/stats/users")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
  expect(res.body).toBeInstanceOf(Array);
});

it("should get stats", async () => {
  const res = await request
    .get("/api/v1/stats/")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
  expect(res.body).toBeInstanceOf(Object);
});

it("should not have an access", async () => {
  const res1 = await request.post("/api/v1/users/login").send({
    username: "jcardon0",
    password: "test",
  });
  const token = res1.body.token;
  const res2 = await request
    .get("/api/v1/stats/topusers")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res2.statusCode).toEqual(401);
});
