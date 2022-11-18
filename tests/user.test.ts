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

it("should get profile", async () => {
  const res = await request
    .get("/api/v1/users/profile/1")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
});

it("should not get profile", async () => {
  const res = await request
    .get("/api/v1/users/-20")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(404);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toBe("user not found");
});

it("should get user", async () => {
  const res = await request
    .get("/api/v1/users/1")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
});

it("should follow user", async () => {
  const res = await request
    .post("/api/v1/users/follow/2")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
});

it("should unfollow user", async () => {
  const res = await request
    .delete("/api/v1/users/follow/2")
    .set("Authorization", `Bearer ${token}`)
    .send();
  expect(res.statusCode).toEqual(200);
});

it("should update user", async () => {
  const res = await request
    .put("/api/v1/users/201")
    .set("Authorization", `Bearer ${token}`)
    .send({
      bio: "updated",
      role: 1,
    });
  expect(res.statusCode).toEqual(200);
});
