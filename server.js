import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor de Briefing UniEduK ativo com Groq 🚀");
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

  const modelsToTry = [
    "llama-3.3-70b-versatile",
    "llama-3.2-11b-text-preview",
    "gemma2-9b-it"
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
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente de marketing do Grupo UniEduK (UniFAJ e UniMAX). Gere textos curtos e criativos para campanhas institucionais de ensino superior.",
            },
            {
              role: "user",
              content: `Crie um texto de ${tipo_peca} para o curso ${curso}, referente ao evento '${nome_evento}', voltado para ${publico}, com tom de voz ${tom_voz}. Data: ${data_evento}. Local: ${link_local}. Observações: ${observacoes}.`,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("🧠 Resposta Groq:", data);

      if (!response.ok || data.error) {
        lastError = { model: modelId, details: data.error || data };
        continue;  // tenta o próximo modelo
      }

      const textoGerado = data.choices?.[0]?.message?.content || "Sem resposta gerada.";

      return res.json({
        texto_gerado: textoGerado.trim(),
        link_canva: "https://www.canva.com/",
      });

    } catch (error) {
      lastError = { model: modelId, details: error.message };
      console.error(`Erro com modelo ${modelId}:`, error);
      continue;
    }
  }

  // se chegou aqui, todos os modelos falharam
  res.status(500).json({
    error: "Todos os modelos Groq falharam",
    last_error: lastError,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} ✅`));
