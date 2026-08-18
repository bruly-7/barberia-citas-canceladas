// app/api/cancel/route.js
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return Response.json({ error: "appointmentId requerido" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // 1. Cancelar la cita
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return Response.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    // Actualizar estado a cancelada
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId);

    // Log: cita cancelada
    await supabase.from("activity_log").insert({
      action: `Cita cancelada — ${appointment.client_name}, ${appointment.time}`,
      appointment_id: appointmentId,
    });

    // 2. Buscar en lista de espera
    const { data: waitlist, error: waitlistError } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1);

    if (waitlistError) {
      return Response.json({ error: "Error consultando lista de espera" }, { status: 500 });
    }

    if (!waitlist || waitlist.length === 0) {
      // No hay nadie en lista de espera
      await supabase.from("activity_log").insert({
        action: `Hueco libre a las ${appointment.time} — sin clientes en espera`,
        appointment_id: appointmentId,
      });
      return Response.json({ success: true, refilled: false });
    }

    // 3. Notificar al primero de la lista (simulado con log)
    const nextClient = waitlist[0];
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${nextClient.phone.replace(/\D/g, "")}&text=¡Hola ${nextClient.name}! Tenemos un hueco disponible a las ${appointment.time}. ¿Te viene bien?`;

    // Eliminar de lista de espera antes de registrar el aviso (evita bloqueo por FK)
    const { error: deleteError } = await supabase.from("waitlist").delete().eq("id", nextClient.id);
    if (deleteError) {
      console.error("Error eliminando de lista de espera:", deleteError);
      return Response.json({ error: "Error actualizando lista de espera" }, { status: 500 });
    }

    await supabase.from("activity_log").insert({
      action: `WhatsApp enviado a ${nextClient.name}: "¿Te viene bien a las ${appointment.time}?"`,
      appointment_id: appointmentId,
      details: { whatsappUrl, waitlist_client: { id: nextClient.id, name: nextClient.name, phone: nextClient.phone } },
    });

    // 4. Actualizar cita a refillada (simulado — en producción esperarías confirmación)
    // Por ahora, lo marcamos como refillado después de 2 segundos (simulado)
    setTimeout(async () => {
      await supabase
        .from("appointments")
        .update({ status: "refilled", client_name: nextClient.name })
        .eq("id", appointmentId);

      await supabase.from("activity_log").insert({
        action: `${nextClient.name} confirmó — hueco refillado a las ${appointment.time}`,
        appointment_id: appointmentId,
      });

      // Actualizar stats (acumulando sobre los valores del día)
      const today = new Date().toISOString().split("T")[0];
      const { data: stats } = await supabase
        .from("daily_stats")
        .select("total_refills, total_recovered")
        .eq("date", today)
        .maybeSingle();

      await supabase.from("daily_stats").upsert(
        {
          date: today,
          total_refills: (stats?.total_refills || 0) + 1,
          total_recovered: (Number(stats?.total_recovered) || 0) + Number(appointment.price),
        },
        { onConflict: "date" }
      );
    }, 2000);

    return Response.json({
      success: true,
      refilled: true,
      client: nextClient.name,
      time: appointment.time,
    });
  } catch (error) {
    console.error("Error en /api/cancel:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
