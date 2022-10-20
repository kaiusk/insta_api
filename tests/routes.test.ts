const request = require("supertest");
describe("API Endpoints", () => {
  let server: any;
  let token = "";

  beforeAll(async () => {
    const mod = await import("../src/index");
    server = (mod as any).default;
    //});

    //beforeAll(async () => {
    const res = await request(server).post("/api/v1/users/login").send({
      username: "sigrimigri",
      password: "test",
    });
    token = res.body.token;
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    }
  });
  it("should login user", async () => {
    const res = await request(server).post("/api/v1/users/login").send({
      username: "sigrimigri",
      password: "test",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
  it("should get profile", async () => {
    const res = await request(server)
      .get("/api/v1/users/profile/1")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(200);
  });
  it("should get user", async () => {
    const res = await request(server)
      .get("/api/v1/users/1")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(200);
  });
  it("should get users", async () => {
    const res = await request(server)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(200);
  });
});
