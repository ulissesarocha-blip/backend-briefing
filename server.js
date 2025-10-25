import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor de Briefing UniEduK ativo com Groq! 🚀");
});

app.post("/briefing", async (req, res) => {
  const { curso, tipo_peca, nome_evento, publico, tom_voz, data_evento, link_local, observacoes } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente de marketing da UniFAJ e UniMAX. Gere textos curtos e criativos para campanhas institucionais.",
          },
          {
            role: "user",
            content: `Crie um texto de ${tipo_peca} para o curso ${curso}, com o evento '${nome_evento}', voltado para ${publico}, com tom ${tom_voz}. Data: ${data_evento}. Local: ${link_local}. Observações: ${observacoes}.`,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Resposta Groq:", data);

    if (!response.ok) {
      return res.status(500).json({
        error: "Erro do Groq",
        details: data,
      });
    }

    const textoGerado = data?.choices?.[0]?.message?.content || "Sem resposta do modelo.";

    res.json({
      texto_gerado: textoGerado,
      link_canva: "https://www.canva.com/",
    });
  } catch (error) {
    console.error("Erro geral:", error);
    res.status(500).json({ error: "Erro interno no servidor", details: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
