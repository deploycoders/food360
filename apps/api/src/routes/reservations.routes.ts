import { Router, type Request, type Response } from "express";

import { supabaseAdmin } from "@food360/database";
import { requireRole } from "../../middleware";

export const reservationsRouter: Router = Router();

reservationsRouter.get("/", async (req: Request, res: Response) => {
  const restaurant_id = req.restaurantId;

  try {
    const { data: reservations, error } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .order("reservation_date", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      data: reservations,
    });
  } catch (error: any) {
    console.error("Error obteniendo reservas:", error);

    return res.status(500).json({
      success: false,
      error: error?.message ?? "No se pudieron obtener las reservas",
    });
  }
});

reservationsRouter.get("/:id", async (req: Request, res: Response) => {
  const restaurant_id = req.restaurantId;
  const { id } = req.params;

  try {
    const { data: reservation, error } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("id", id)
      .eq("restaurant_id", restaurant_id)
      .maybeSingle();

    if (error) throw error;

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reserva no encontrada",
      });
    }

    return res.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    console.error("Error obteniendo reserva:", error);

    return res.status(500).json({
      success: false,
      error: error?.message ?? "No se pudo obtener la reserva",
    });
  }
});

reservationsRouter.post(
  "/",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;

    const { customer_id, table_id, reservation_date, party_size } = req.body;

    if (typeof reservation_date !== "string" || !reservation_date.trim()) {
      return res.status(400).json({
        success: false,
        error: "reservation_date is required",
      });
    }

    if (
      typeof party_size !== "number" ||
      !Number.isInteger(party_size) ||
      party_size <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "party_size must be a positive integer",
      });
    }

    try {
      const { data: reservation, error } = await supabaseAdmin
        .from("reservations")
        .insert({
          restaurant_id,
          customer_id: customer_id ?? null,
          table_id: table_id ?? null,
          reservation_date,
          party_size,
          status: "REQUESTED",
        })
        .select("*")
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: reservation,
      });
    } catch (error: any) {
      console.error("Error creando reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo crear la reserva",
      });
    }
  },
);

reservationsRouter.post(
  "/:id/arrive",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      const { data: reservation, error: findError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (findError) throw findError;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      if (reservation.status !== "CONFIRMED") {
        return res.status(409).json({
          success: false,
          error: `No se puede marcar como llegada una reserva con estado ${reservation.status}`,
        });
      }

      const { data: updatedReservation, error: updateError } =
        await supabaseAdmin
          .from("reservations")
          .update({
            status: "ARRIVED",
            arrived_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("restaurant_id", restaurant_id)
          .select("*")
          .single();

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      console.error("Error marcando llegada de reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo marcar la llegada de la reserva",
      });
    }
  },
);

reservationsRouter.post(
  "/:id/seat",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      const { data: reservation, error: findError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (findError) throw findError;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      if (reservation.status !== "ARRIVED") {
        return res.status(409).json({
          success: false,
          error: `No se puede sentar una reserva con estado ${reservation.status}`,
        });
      }

      const { data: updatedReservation, error: updateError } =
        await supabaseAdmin
          .from("reservations")
          .update({
            status: "SEATED",
            seated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("restaurant_id", restaurant_id)
          .select("*")
          .single();

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      console.error("Error sentando reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo sentar la reserva",
      });
    }
  },
);

reservationsRouter.post(
  "/:id/confirm",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      // Buscar la reserva y comprobar que pertenece al restaurante
      const { data: reservation, error: findError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (findError) throw findError;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      // Solo REQUESTED puede pasar a CONFIRMED
      if (reservation.status !== "REQUESTED") {
        return res.status(409).json({
          success: false,
          error: `No se puede confirmar una reserva con estado ${reservation.status}`,
        });
      }

      const { data: updatedReservation, error: updateError } =
        await supabaseAdmin
          .from("reservations")
          .update({
            status: "CONFIRMED",
          })
          .eq("id", id)
          .eq("restaurant_id", restaurant_id)
          .select("*")
          .single();

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      console.error("Error confirmando reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo confirmar la reserva",
      });
    }
  },
);

reservationsRouter.post(
  "/:id/complete",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      const { data: reservation, error: findError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (findError) throw findError;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      if (reservation.status !== "SEATED") {
        return res.status(409).json({
          success: false,
          error: `No se puede completar una reserva con estado ${reservation.status}`,
        });
      }

      const { data: updatedReservation, error: updateError } =
        await supabaseAdmin
          .from("reservations")
          .update({
            status: "COMPLETED",
          })
          .eq("id", id)
          .eq("restaurant_id", restaurant_id)
          .select("*")
          .single();

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      console.error("Error completando reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo completar la reserva",
      });
    }
  },
);

reservationsRouter.post(
  "/:id/cancel",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      const { data: reservation, error: findError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (findError) throw findError;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      const cancellableStatuses = ["REQUESTED", "CONFIRMED", "SEATED"];

      if (!cancellableStatuses.includes(reservation.status)) {
        return res.status(409).json({
          success: false,
          error: `No se puede cancelar una reserva con estado ${reservation.status}`,
        });
      }

      const { data: updatedReservation, error: updateError } =
        await supabaseAdmin
          .from("reservations")
          .update({
            status: "CANCELLED",
          })
          .eq("id", id)
          .eq("restaurant_id", restaurant_id)
          .select("*")
          .single();

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      console.error("Error cancelando reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo cancelar la reserva",
      });
    }
  },
);

reservationsRouter.post(
  "/:id/no-show",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    try {
      const { data: reservation, error: findError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .maybeSingle();

      if (findError) throw findError;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      const noShowStatuses = ["CONFIRMED", "ARRIVED"];

      if (!noShowStatuses.includes(reservation.status)) {
        return res.status(409).json({
          success: false,
          error: `No se puede marcar como no-show una reserva con estado ${reservation.status}`,
        });
      }

      const { data: updatedReservation, error: updateError } =
        await supabaseAdmin
          .from("reservations")
          .update({
            status: "NO_SHOW",
          })
          .eq("id", id)
          .eq("restaurant_id", restaurant_id)
          .select("*")
          .single();

      if (updateError) throw updateError;

      return res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error: any) {
      console.error("Error marcando reserva como no-show:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo marcar la reserva como no-show",
      });
    }
  },
);

reservationsRouter.patch(
  "/:id",
  requireRole(["owner", "admin"]),
  async (req: Request, res: Response) => {
    const restaurant_id = req.restaurantId;
    const { id } = req.params;

    const { customer_id, table_id, reservation_date, party_size } = req.body;

    const updates: Record<string, unknown> = {};

    if (customer_id !== undefined) {
      updates.customer_id = customer_id;
    }

    if (table_id !== undefined) {
      updates.table_id = table_id;
    }

    if (reservation_date !== undefined) {
      if (typeof reservation_date !== "string" || !reservation_date.trim()) {
        return res.status(400).json({
          success: false,
          error: "reservation_date must be a valid string",
        });
      }

      updates.reservation_date = reservation_date;
    }

    if (party_size !== undefined) {
      if (
        typeof party_size !== "number" ||
        !Number.isInteger(party_size) ||
        party_size <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "party_size must be a positive integer",
        });
      }

      updates.party_size = party_size;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No hay campos para actualizar",
      });
    }

    try {
      const { data: reservation, error } = await supabaseAdmin
        .from("reservations")
        .update(updates)
        .eq("id", id)
        .eq("restaurant_id", restaurant_id)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      return res.json({
        success: true,
        data: reservation,
      });
    } catch (error: any) {
      console.error("Error actualizando reserva:", error);

      return res.status(500).json({
        success: false,
        error: error?.message ?? "No se pudo actualizar la reserva",
      });
    }
  },
);
