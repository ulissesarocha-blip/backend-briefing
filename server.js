import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// Rota base para checar o status do servidor
app.get("/", (req, res) => {
  res.send("🚀 Servidor de Briefing UniEduK ativo com Groq + Make + Canva!");
});

app.post("/briefing", async (req, res) => {
  const {
    curso,
    tipo_peca,
    nome_evento,
    publico,
    tom_voz,
    data_evento,
    link_local,
    observacoes,
  } = req.body;

  // Modelos Groq disponíveis (com fallback automático)
  const modelsToTry = [
    "llama-3.3-70b-versatile", // modelo mais novo e robusto
    "gemma2-9b-it" // alternativa leve
  ];

  let lastError = null;

  for (const modelId of modelsToTry) {
    try {
      console.log(`🔄 Tentando modelo: ${modelId}`);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelId,
          temperature: 0.8,
          max_tokens: 600,
          messages: [
            {
              role: "system",
              content: "Você é um assistente de marketing do Grupo UniEduK (UniFAJ e UniMAX). Gere textos criativos, curtos e institucionais para campanhas e posts acadêmicos.",
            },
            {
              role: "user",
              content: `
              Crie um texto para uma peça de marketing (${tipo_peca})
              do curso ${curso}, referente ao evento '${nome_evento}',
              voltado para ${publico}, com tom de voz ${tom_voz}.
              Data do evento: ${data_evento}.
              Local: ${link_local}.
              Observações adicionais: ${observacoes}.
              Finalize com hashtags e inclua uma chamada de engajamento.
              `,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("🧠 Resposta Groq:", data);

      if (!response.ok || data.error) {
        lastError = { model: modelId, details: data.error || data };
        continue; // tenta o próximo modelo
      }

      const textoGerado = data.choices?.[0]?.message?.content || "Sem resposta gerada.";

      // ✅ Envio automático para o Make (integração)
      try {
        const makeResponse = await fetch("https://hook.us2.make.com/6tl04pgldoxs7jpq5k16sm1dsh2zhdhu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curso,
            tipo_peca,
            nome_evento,
            publico,
            tom_voz,
            data_evento,
            link_local,
            observacoes,
            texto_gerado: textoGerado,
            link_canva: "https://www.canva.com/",
          }),
        });

        console.log("✅ Dados enviados ao Make:", makeResponse.status);
      } catch (err) {
        console.error("⚠️ Erro ao enviar dados ao Make:", err);
      }

      // Retorno para o front-end
      return res.json({
        texto_gerado: textoGerado.trim(),
        link_canva: "https://www.canva.com/",
      });
    } catch (error) {
      lastError = { model: modelId, details: error.message };
      console.error(`❌ Erro com modelo ${modelId}:`, error);
      continue;
    }
  }

  // Se todos os modelos falharem
  res.status(500).json({
    error: "Todos os modelos Groq falharam",
    last_error: lastError,
  });
});

// Porta Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
