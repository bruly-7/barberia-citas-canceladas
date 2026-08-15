"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Scissors, Bell, Clock, Euro, X, RotateCcw, AlertCircle } from "lucide-react";

const C = {
  bg: "#15130F",
  surface: "#1F1B16",
  border: "#3A332A",
  text: "#F2E9DA",
  muted: "#A79C89",
  brass: "#C9974B",
  brassSoft: "rgba(201,151,75,0.14)",
  burgundy: "#B15252",
  burgundySoft: "rgba(139,58,58,0.16)",
  sage: "#8AA184",
  sageSoft: "rgba(110,131,104,0.16)",
};

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [stats, setStats] = useState({ refills: 0, recovered: 0 });
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apptRes, waitRes, logRes, statsRes] = await Promise.all([
          supabase.from("appointments").select("*").order("created_at", { ascending: false }),
          supabase.from("waitlist").select("*").order("created_at", { ascending: true }),
          supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10),
          supabase
            .from("daily_stats")
            .select("*")
            .eq("date", new Date().toISOString().split("T")[0])
            .single(),
        ]);

        if (apptRes.error) throw apptRes.error;
        if (waitRes.error) throw waitRes.error;
        if (logRes.error) throw logRes.error;

        setAppointments(apptRes.data || []);
        setWaitlist(waitRes.data || []);
        setLog(logRes.data || []);

        if (!statsRes.error && statsRes.data) {
          setStats({
            refills: statsRes.data.total_refills || 0,
            recovered: statsRes.data.total_recovered || 0,
          });
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waitlist" },
        () => loadData()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleCancel = async (appointmentId) => {
    try {
      const response = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) throw new Error("Error cancelando cita");

      // Recargar datos
      const [apptRes, statsRes] = await Promise.all([
        supabase.from("appointments").select("*").order("created_at", { ascending: false }),
        supabase
          .from("daily_stats")
          .select("*")
          .eq("date", new Date().toISOString().split("T")[0])
          .single(),
      ]);

      setAppointments(apptRes.data || []);
      if (statsRes.data) {
        setStats({
          refills: statsRes.data.total_refills || 0,
          recovered: statsRes.data.total_recovered || 0,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  const handleReset = async () => {
    if (!confirm("¿Reiniciar la demo? Se borrarán todos los datos de hoy.")) return;
    try {
      await Promise.all([
        supabase.from("appointments").delete().neq("id", 0),
        supabase.from("waitlist").delete().neq("id", 0),
        supabase.from("activity_log").delete().neq("id", 0),
      ]);
      setAppointments([]);
      setWaitlist([]);
      setLog([]);
      setStats({ refills: 0, recovered: 0 });
    } catch (err) {
      console.error("Error reiniciando:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ background: C.bg, color: C.text }} className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Scissors size={32} style={{ color: C.brass }} />
          </div>
          <p style={{ color: C.muted }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, color: C.text }} className="w-full min-h-screen p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .f-display { font-family: 'Fraunces', serif; }
        .f-body { font-family: 'Inter', sans-serif; }
        .f-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-5xl mx-auto f-body">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1" style={{ color: C.brass }}>
              <Scissors size={18} />
              <span className="f-mono text-xs tracking-widest uppercase">Barbería · Sistema en vivo</span>
            </div>
            <h1 className="f-display text-3xl font-medium">Citas canceladas → Refilladas</h1>
            <p className="text-sm mt-1" style={{ color: C.muted }}>
              Cancela una cita, el sistema busca en la lista de espera y avisa automáticamente.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border focus:outline-none"
            style={{ borderColor: C.border, color: C.muted }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border" style={{ background: C.burgundySoft, borderColor: C.burgundy }}>
            <AlertCircle size={16} style={{ color: C.burgundy, marginTop: "2px" }} />
            <div>
              <div className="font-medium" style={{ color: C.burgundy }}>Error</div>
              <div style={{ color: C.muted }}>{error}</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Huecos refillados", value: stats.refills, icon: Bell },
            { label: "Respuesta media", value: stats.refills ? "~3 min" : "—", icon: Clock },
            { label: "Recuperado", value: `€${stats.recovered.toFixed(2)}`, icon: Euro },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 border" style={{ background: C.surface, borderColor: C.border }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: C.brass }}>
                <s.icon size={16} />
                <span className="text-xs uppercase tracking-wide" style={{ color: C.muted }}>{s.label}</span>
              </div>
              <div className="f-display text-2xl">{s.value}</div>
            </div>
          ))}
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-xl border p-12 text-center" style={{ background: C.surface, borderColor: C.border }}>
            <Scissors size={32} style={{ color: C.muted, margin: "0 auto 1rem" }} />
            <p style={{ color: C.muted }}>No hay citas cargadas. Carga datos de prueba desde la API o BD.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Agenda */}
            <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
              <div className="px-4 py-3 border-b f-mono text-xs uppercase tracking-widest" style={{ borderColor: C.border, color: C.muted }}>
                Agenda de hoy ({appointments.length})
              </div>
              <div>
                {appointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-b-0" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="f-mono text-sm w-12 shrink-0" style={{ color: C.muted }}>{a.time}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{a.client_name}</div>
                        <div className="text-xs truncate" style={{ color: C.muted }}>
                          {a.service} · €{a.price}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs px-2 py-1 rounded-full f-mono whitespace-nowrap"
                        style={{
                          color: a.status === "confirmed" ? C.sage : a.status === "refilled" ? C.sage : C.burgundy,
                          background: a.status === "confirmed" ? C.sageSoft : a.status === "refilled" ? C.sageSoft : C.burgundySoft,
                        }}
                      >
                        {a.status === "confirmed" ? "Confirmada" : a.status === "refilled" ? "Refillada" : "Cancelada"}
                      </span>
                      {a.status === "confirmed" && (
                        <button
                          onClick={() => handleCancel(a.id)}
                          className="p-1.5 rounded-full border focus:outline-none"
                          style={{ borderColor: C.border, color: C.muted }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              <div className="rounded-xl border" style={{ background: C.surface, borderColor: C.border }}>
                <div className="px-4 py-3 border-b f-mono text-xs uppercase tracking-widest" style={{ borderColor: C.border, color: C.muted }}>
                  Lista de espera ({waitlist.length})
                </div>
                <div>
                  {waitlist.length === 0 ? (
                    <div className="px-4 py-4 text-sm" style={{ color: C.muted }}>Sin clientes en espera</div>
                  ) : (
                    waitlist.map((w, i) => (
                      <div key={w.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0" style={{ borderColor: C.border }}>
                        <span className="f-mono text-xs w-5" style={{ color: i === 0 ? C.brass : C.muted }}>{i + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{w.name}</div>
                          <div className="f-mono text-xs" style={{ color: C.muted }}>{w.phone}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border flex-1" style={{ background: C.surface, borderColor: C.border }}>
                <div className="px-4 py-3 border-b f-mono text-xs uppercase tracking-widest" style={{ borderColor: C.border, color: C.muted }}>
                  Actividad
                </div>
                <div className="px-4 py-3 text-xs space-y-2" style={{ color: C.muted }}>
                  {log.length === 0 ? (
                    <p>Sin actividad aún</p>
                  ) : (
                    log.map((l) => (
                      <div key={l.id} className="pb-2 border-b last:border-b-0">
                        {l.action}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs" style={{ color: C.muted }}>
          <span className="f-mono tracking-widest uppercase" style={{ color: C.brass }}>damii_builds</span> — Prototipo en vivo
        </div>
      </div>
    </div>
  );
}
