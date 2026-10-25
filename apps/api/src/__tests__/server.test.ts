import supertest from "supertest";
import { describe, it, expect } from "@jest/globals";
import { createServer } from "../server";

describe("Server", () => {
  it("health check returns 200", async () => {
    await supertest(createServer())
      .get("/status")
      .expect(200)
      .then((res) => {
        expect(res.ok).toBe(true);
      });
  });

  it("rejects malformed stable public IDs before querying Supabase", async () => {
    await supertest(createServer())
      .get("/api/v1/public/restaurants/id/not-an-id")
      .expect(400)
      .expect({ success: false, error: "El identificador no es válido" });
  });

  it("rejects malformed public slugs before querying Supabase", async () => {
    await supertest(createServer())
      .get("/api/v1/public/restaurants/bad%20slug")
      .expect(400)
      .expect({ success: false, error: "El slug no es válido" });
  });

  it("does not normalize whitespace or uppercase in public slugs", async () => {
    await supertest(createServer())
      .get("/api/v1/public/restaurants/%20Food360%20")
      .expect(400)
      .expect({ success: false, error: "El slug no es válido" });
  });

  it("rejects slugs reserved by Client routes", async () => {
    await supertest(createServer())
      .get("/api/v1/public/restaurants/r")
      .expect(400)
      .expect({ success: false, error: "El slug no es válido" });
  });
});
