import app from "../src/server";

const supertest = require("supertest");
const request = supertest(app);

it("should login user", async () => {
  const res = await request.post("/api/v1/users/login").send({
    username: "sigrimigri",
    password: "test",
  });
  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty("token");
});

it("should not login user", async () => {
  const res = await request.post("/api/v1/users/login").send({
    username: "sigrimigri",
    password: "test123",
  });
  expect(res.statusCode).toEqual(403);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("invalid credentials");
});

it("should not login user (empty data)", async () => {
  const res = await request.post("/api/v1/users/login").send();
  expect(res.statusCode).toEqual(403);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("invalid credentials");
});
