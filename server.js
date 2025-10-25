import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// rota inicial só para teste rápido no navegador
app.get("/", (req, res) => {
  res.send("Servidor de Briefing UniEduK ativo com Groq 🚀");
});

// rota principal de geração
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

  try {
    console.log("📨 Recebendo requisição do front:", req.body);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-text-preview",
        temperature: 0.8,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente de marketing do Grupo UniEduK (UniFAJ e UniMAX). Gere textos curtos e criativos, adequados para posts e campanhas institucionais de ensino superior, com linguagem inspiradora, profissional e humana.",
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

    // tratamento de erro da API Groq
    if (!response.ok || data.error) {
      return res.status(500).json({
        error: "Erro ao processar resposta do modelo Groq",
        details: data.error || data,
      });
    }

    // extrai o texto do modelo
    const textoGerado =
      data?.choices?.[0]?.message?.content || "Sem resposta gerada pelo modelo.";

    // pequena pausa opcional (garante sincronia no Make / front)
    await new Promise((resolve) => setTimeout(resolve, 500));

    res.json({
      texto_gerado: textoGerado.trim(),
      link_canva: "https://www.canva.com/",
    });
  } catch (error) {
    console.error("🔥 Erro geral no servidor:", error);
    res.status(500).json({ error: "Erro interno no servidor", details: error.message });
  }
});

// inicializa o servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} ✅`);
});
