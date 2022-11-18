/*const request = require("supertest");
let server: any;
let token = "";

export function setupBeforeAndAfter() {
    beforeAll(() => {
        const mod = await import("./src/index");
        server = (mod as any).default;

        const res = await request(server).post("/api/v1/users/login").send({
            username: "sigrimigri",
            password: "test",
        });
        token = res.body.token;
    });
    afterAll(() => {
        if (server) {
            server.close(done);
        }
    });
    //beforeEach(() => shared-before-each-code);
    //afterEach(() => shared-after-each-code);
}

beforeAll(async () => );

afterAll((done) => );
*/
