import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";

// carregar variáveis de ambiente
dotenv.config();

// inicializa app Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// inicializa cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// rota principal de geração de briefing
app.post("/briefing", async (req, res) => {
  try {
    const briefing = req.body;

    // prompt base
    const prompt = `
Você é um redator publicitário do Grupo UniEduK. 
Crie uma legenda para ${briefing.tipo_peca} do curso ${briefing.curso}.
Tema: ${briefing.nome_evento}.
Público: ${briefing.publico}.
Tom: ${briefing.tom_voz}.
Observações: ${briefing.observacoes}.
`;

    // chamada à API da OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const texto = response.choices[0].message.content;

    // gera link base do Canva (ajuste seu template depois)
    const linkCanva = `https://www.canva.com/design/use?template=YOUR_TEMPLATE_ID&text=${encodeURIComponent(texto)}`;

    // ⚠️ Envia resultado para o Make (substitua o link abaixo pelo seu webhook real)
    await fetch("https://hook.us2.make.com/b2xcvlja1m1oi16wnckuvz1xnsg89h45", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curso: briefing.curso,
        tipo_peca: briefing.tipo_peca,
        nome_evento: briefing.nome_evento,
        publico: briefing.publico,
        texto_gerado: texto,
        link_canva: linkCanva
      })
    });

    // resposta para o frontend
    res.json({
      texto_gerado: texto,
      link_canva: linkCanva
    });

  } catch (err) {
    console.error("❌ Erro ao gerar briefing:", err);
    res.status(500).json({ error: "Erro ao gerar peça" });
  }
});

// rota raiz (teste rápido)
app.get("/", (req, res) => {
  res.send("Servidor de Briefing UniEduK ativo!");
});

// iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
