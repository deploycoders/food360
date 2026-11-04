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

  it("rejects malformed table public codes before querying Supabase", async () => {
    await supertest(createServer())
      .get("/api/v1/public/tables/not-a-table-code")
      .expect(400)
      .expect({ success: false, error: "El código de mesa no es válido" });
  });

  it("rejects table codes without the t_ prefix", async () => {
    await supertest(createServer())
      .get("/api/v1/public/tables/abcdefgh12345678")
      .expect(400)
      .expect({ success: false, error: "El código de mesa no es válido" });
  });

  it("rejects malformed restaurant public id in public orders before querying Supabase", async () => {
    await supertest(createServer())
      .post("/api/v1/public/orders")
      .send({
        restaurant_public_id: "not-a-uuid",
        full_name: "Cliente",
        phone: "+584141234567",
        origin: "TAKEAWAY",
        items: [{ product_id: "04f5fa2b-608a-4e4e-898b-550afcf0a19e", quantity: 1 }],
      })
      .expect(400)
      .expect({ success: false, error: "El identificador del restaurante no es válido" });
  });

  it("rejects invalid origin in public orders before querying Supabase", async () => {
    await supertest(createServer())
      .post("/api/v1/public/orders")
      .send({
        restaurant_public_id: "d79e889e-fa24-4303-adb0-a6da1cf8abdd",
        full_name: "Cliente",
        phone: "+584141234567",
        origin: "UNKNOWN",
        items: [{ product_id: "04f5fa2b-608a-4e4e-898b-550afcf0a19e", quantity: 1 }],
      })
      .expect(400)
      .expect({
        success: false,
        error: "El origen del pedido no es válido. Debe ser DINE_IN, TAKEAWAY o DELIVERY",
      });
  });
});
