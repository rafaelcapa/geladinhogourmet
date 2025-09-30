let estoque = [];
const numero = "558199527355"; // seu WhatsApp
const container = document.getElementById("sabores-container");

async function carregarEstoque() {
  const res = await fetch("/estoque");
  estoque = await res.json();
  container.innerHTML = ""; // limpa antes
  adicionarSabor(); // cria o primeiro sabor com base no backend
}

function atualizarTotal() {
  let total = 0;
  document.querySelectorAll(".sabor-item").forEach(item => {
    const select = item.querySelector(".sabor");
    const qtdInput = item.querySelector(".quantidade");
    const sabor = estoque.find(s => s.nome === select.value);
    const qtd = parseInt(qtdInput.value) || 0;

    if (qtd > sabor.qtd) {
      qtdInput.value = sabor.qtd;
    }

    if (sabor) total += sabor.preco * qtd;
  });
  document.getElementById("totalSpan").innerText = total.toFixed(2).replace(".", ",");
}

function atualizarOpcoes() {
  const usados = Array.from(document.querySelectorAll(".sabor")).map(s => s.value);
  document.querySelectorAll(".sabor").forEach(select => {
    Array.from(select.options).forEach(opt => {
      if (usados.includes(opt.value) && opt.value !== select.value) {
        opt.disabled = true;
      } else {
        opt.disabled = false;
      }
    });

    const qtdInput = select.parentElement.querySelector(".quantidade");
    const sabor = estoque.find(s => s.nome === select.value);
    if (sabor) {
      const totalSelecionado = Array.from(document.querySelectorAll(".sabor-item"))
        .filter(item => item.querySelector(".sabor").value === sabor.nome)
        .reduce((acc, item) => acc + parseInt(item.querySelector(".quantidade").value || 0), 0);
      qtdInput.max = Math.max(0, sabor.qtd - (totalSelecionado - parseInt(qtdInput.value || 0)));
    }
  });
}

function adicionarSabor() {
  if (!estoque || estoque.length === 0) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("sabor-item");

  let options = estoque.map(s =>
    `<option value="${s.nome}" data-preco="${s.preco}" data-qtd="${s.qtd}">
      ${s.nome} (R$${s.preco},00) - ${s.qtd} disponíveis
    </option>`).join("");

  const valorInicialQtd = container.children.length === 0 ? 1 : 0;

  wrapper.innerHTML = `
    <label>Sabor:</label>
    <select class="sabor" required>${options}</select>
    <label>Quantidade:</label>
    <input type="number" class="quantidade" min="0" value="${valorInicialQtd}" required>
  `;

  if (container.children.length >= 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-remover";
    btn.textContent = "Remover sabor";
    btn.addEventListener("click", () => {
      wrapper.remove();
      atualizarTotal();
      atualizarOpcoes();
    });
    wrapper.appendChild(btn);
  }

  container.appendChild(wrapper);

  const select = wrapper.querySelector(".sabor");
  const qtdInput = wrapper.querySelector(".quantidade");

  function atualizarMaxQtd() {
    atualizarOpcoes();
    atualizarTotal();
  }

  select.addEventListener("change", atualizarMaxQtd);
  qtdInput.addEventListener("input", atualizarTotal);

  atualizarMaxQtd();
}

document.getElementById("addSabor").addEventListener("click", adicionarSabor);

document.getElementById("copiarPix").addEventListener("click", () => {
  navigator.clipboard.writeText("03945649447");
  alert("Chave PIX (CPF: 03945649447) copiada!");
});

document.getElementById("pedidoForm").addEventListener("submit", async e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const setor = document.getElementById("setor").value;

  let mensagem = `Olá, Me chamo ${nome}`;
  if (setor) mensagem += `, do setor ${setor}`;
  mensagem += `%0A%0AQuero:%0A`;

  const itens = [];
  document.querySelectorAll(".sabor-item").forEach(item => {
    const select = item.querySelector(".sabor");
    const qtdInput = item.querySelector(".quantidade");
    const qtd = parseInt(qtdInput.value) || 0;
    if (qtd > 0) {
      mensagem += `* ${qtd}x ${select.value}%0A`;
      itens.push({ nome: select.value, qtd });
    }
  });

  const total = document.getElementById("totalSpan").innerText;
  mensagem += `%0ATotal: R$ ${total}%0A%0ASegue meu comprovante do PIX:`;

  // 🚀 Envia para backend (baixa estoque + salva pedido)
  try {
    console.log("🔄 Enviando pedido para backend:", { nome, setor, itens, total });
    const resp = await fetch("/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, setor, itens, total })
    });
    const data = await resp.json();
    console.log("✅ Resposta do backend:", data);
  } catch (err) {
    console.error("❌ Erro ao enviar pedido:", err);
  }

  // 🚀 Abre WhatsApp
  const url = `https://wa.me/${numero}?text=${mensagem}`;
  window.open(url, "_blank");

  // Recarrega estoque atualizado
  carregarEstoque();
});

// 🚀 Carrega o estoque do backend ao abrir a página
carregarEstoque();
