import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/briefing", async (req, res) => {
  try {
    const briefing = req.body;
    const prompt = `
Você é um redator publicitário do Grupo UniEduK. 
Crie uma legenda para ${briefing.tipo_peca} do curso ${briefing.curso}.
Tema: ${briefing.nome_evento}.
Público: ${briefing.publico}.
Tom: ${briefing.tom_voz}.
Observações: ${briefing.observacoes}.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const texto = response.choices[0].message.content;
    const linkCanva = `https://www.canva.com/design/use?template=YOUR_TEMPLATE_ID&text=${encodeURIComponent(texto)}`;

// 🔗 Envia o resultado para o Make (webhook)
await fetch("https://hook.us2.make.com/b2xcvlja1m1oi16wnckuvz1xnsg89h45", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    curso: briefing.curso,
    tipo_peca: briefing.tipo_peca,
    nome_evento: briefing.nome_evento,
    publico: briefing.publico,
    texto_gerado: texto
  })
});

    
    res.json({
      texto_gerado: texto,
      link_canva: linkCanva
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar peça" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor de Briefing UniEduK ativo!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
