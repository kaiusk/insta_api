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

it("should get single post", async () => {
  const res = await request
    .get("/api/v1/posts/1")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
  //expect(JSON.parse(res.body)).toHaveProperty("id");
});

it("should get followed user posts", async () => {
  const res = await request
    .get("/api/v1/posts/overview")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
  //expect(JSON.parse(res.body)).toHaveProperty("id");
});
