import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY not configured");
}
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BookingEmailRequest {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const {
      clientName,
      clientEmail,
      serviceName,
      providerName,
      appointmentDate,
      appointmentTime,
    }: BookingEmailRequest = await req.json();

    if (!clientName || !clientEmail || !serviceName || !appointmentDate || !appointmentTime) {
      throw new Error("Campos obrigatórios ausentes");
    }

    const emailResponse = await resend.emails.send({
      from: "Boo Agendamentos <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `Agendamento Confirmado - ${serviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; color: #fff; }
            .header h1 { margin: 0; font-size: 22px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .body { padding: 32px; }
            .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
            .details { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #6b7280; font-size: 14px; }
            .detail-value { color: #111827; font-weight: 600; font-size: 15px; }
            .highlight { color: #6366f1; font-size: 16px; }
            .footer { text-align: center; padding: 24px 32px; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
            .checkmark { font-size: 48px; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="checkmark">✅</div>
              <h1>Agendamento Confirmado!</h1>
              <p>Seu horário foi reservado com sucesso</p>
            </div>
            <div class="body">
              <p class="greeting">Olá, <strong>${clientName}</strong>!</p>
              <p class="greeting">Aqui estão os detalhes do seu próximo compromisso:</p>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Serviço</span>
                  <span class="detail-value">${serviceName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Empresa</span>
                  <span class="detail-value">${providerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📅 Data</span>
                  <span class="detail-value highlight">${appointmentDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">⏰ Horário</span>
                  <span class="detail-value highlight">${appointmentTime}</span>
                </div>
              </div>
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Nos vemos em breve!
              </p>
            </div>
            <div class="footer">
              <p>Boo Agendamentos &copy; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Booking confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending booking email:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
