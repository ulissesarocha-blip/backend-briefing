import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor de Briefing UniEduK ativo com Groq! 🚀");
});

// 🚀 Rota principal do formulário
app.post("/briefing", async (req, res) => {
  const { curso, tipo_peca, nome_evento, publico, tom_voz, data_evento, link_local, observacoes } =
    req.body;

  try {
    // 🧠 Geração de texto via Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // modelo rápido e gratuito
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente de marketing da UniFAJ e UniMAX. Gere textos curtos e criativos para campanhas.",
          },
          {
            role: "user",
            content: `Crie um texto de ${tipo_peca} para o curso ${curso}, 
              com o evento '${nome_evento}', voltado para ${publico}, 
              com tom ${tom_voz}. Data: ${data_evento}. Local: ${link_local}. 
              Observações: ${observacoes}.`,
          },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const textoGerado = data?.choices?.[0]?.message?.content || "Não foi possível gerar o texto.";

    // 🔗 simulação de integração futura com Canva
    const linkCanva = "https://www.canva.com/";

    res.json({
      texto_gerado: textoGerado,
      link_canva: linkCanva,
    });
  } catch (error) {
    console.error("Erro ao gerar briefing:", error);
    res.status(500).json({ error: "Erro interno ao gerar briefing" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
