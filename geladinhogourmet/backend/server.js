const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const dbPath = path.join(__dirname, "db.json");

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// 📌 Estoque
app.get("/estoque", (req, res) => {
  const db = readDB();
  res.json(db.estoque);
});

app.post("/estoque", (req, res) => {
  const db = readDB();
  db.estoque = req.body;
  writeDB(db);
  console.log("📦 Estoque atualizado:", db.estoque);
  res.json({ success: true });
});

// 📌 Pedidos
app.get("/pedidos", (req, res) => {
  const db = readDB();
  res.json(db.pedidos || []);
});

app.post("/pedido", (req, res) => {
  const db = readDB();
  const pedido = req.body;

  console.log("📥 Pedido recebido:", pedido);

  // 🚨 Atualiza estoque
  pedido.itens.forEach(item => {
    const sabor = db.estoque.find(s => s.nome === item.nome);
    if (sabor) {
      sabor.qtd = Math.max(0, sabor.qtd - item.qtd);
    }
  });

  // Salva pedido
  db.pedidos = db.pedidos || [];
  db.pedidos.push(pedido);

  writeDB(db);
  console.log("✅ Estoque após pedido:", db.estoque);
  res.json({ success: true, estoque: db.estoque });
});

// 📌 Login simples
app.post("/login", (req, res) => {
  const { user, pass } = req.body;
  if (user === "geladinho" && pass === "Silvana") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.delete("/pedidos/:index", (req, res) => {
  const db = readDB();
  db.pedidos.splice(req.params.index, 1);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
