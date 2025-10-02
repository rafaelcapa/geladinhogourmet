let estoque = [];
const numero = "5581999527355"; // seu WhatsApp correto
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
    const qtdSelect = item.querySelector(".quantidade");
    const sabor = estoque.find(s => s.nome === select.value);
    const qtd = parseInt(qtdSelect.value) || 0;

    if (sabor) total += sabor.preco * qtd;
  });
  document.getElementById("totalSpan").innerText = total.toFixed(2).replace(".", ",");
}

function atualizarOpcoes() {
  const usados = Array.from(document.querySelectorAll(".sabor")).map(s => s.value);

  document.querySelectorAll(".sabor-item").forEach(item => {
    const select = item.querySelector(".sabor");
    const qtdSelect = item.querySelector(".quantidade");

    // desabilita sabores já escolhidos em outros selects
    Array.from(select.options).forEach(opt => {
      if (usados.includes(opt.value) && opt.value !== select.value) {
        opt.disabled = true;
      } else {
        opt.disabled = false;
      }
    });

    // ajusta as opções de quantidade conforme estoque
    const sabor = estoque.find(s => s.nome === select.value);
    if (sabor) {
      const totalSelecionado = Array.from(document.querySelectorAll(".sabor-item"))
        .filter(i => i.querySelector(".sabor").value === sabor.nome)
        .reduce((acc, i) => acc + parseInt(i.querySelector(".quantidade").value || 0), 0);

      const maxQtd = Math.max(0, sabor.qtd - (totalSelecionado - parseInt(qtdSelect.value || 0)));

      // recria opções de 0 até maxQtd
      qtdSelect.innerHTML = "";
      for (let i = 0; i <= maxQtd; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        if (i === parseInt(qtdSelect.value)) opt.selected = true;
        qtdSelect.appendChild(opt);
      }
    }
  });

  atualizarTotal();
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

  // select de quantidade inicial (vai ser atualizado depois em atualizarOpcoes)
  let optionsQtd = "";
  for (let i = 0; i <= 10; i++) {
    optionsQtd += `<option value="${i}" ${i === valorInicialQtd ? "selected" : ""}>${i}</option>`;
  }

  wrapper.innerHTML = `
    <label>Sabor:</label>
    <select class="sabor" required>${options}</select>
    <label>Quantidade:</label>
    <select class="quantidade" required>${optionsQtd}</select>
  `;

  if (container.children.length >= 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-remover";
    btn.textContent = "Remover sabor";
    btn.addEventListener("click", () => {
      wrapper.remove();
      atualizarOpcoes();
    });
    wrapper.appendChild(btn);
  }

  container.appendChild(wrapper);

  const select = wrapper.querySelector(".sabor");
  const qtdSelect = wrapper.querySelector(".quantidade");

  select.addEventListener("change", atualizarOpcoes);
  qtdSelect.addEventListener("change", atualizarTotal);

  atualizarOpcoes();
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
    const qtdSelect = item.querySelector(".quantidade");
    const qtd = parseInt(qtdSelect.value) || 0;
    if (qtd > 0) {
      mensagem += `* ${qtd}x ${select.value}%0A`;
      itens.push({ nome: select.value, qtd });
    }
  });

  // 🚨 validação: não deixa pedido vazio
  if (itens.length === 0) {
    alert("Pedido inválido: adicione pelo menos 1 sabor.");
    return;
  }

  const total = document.getElementById("totalSpan").innerText;
  mensagem += `%0ATotal: R$ ${total}%0A%0ASegue meu comprovante do PIX:`;

  // 🚀 Envia para backend
  try {
    console.log("🔄 Enviando pedido para backend:", { nome, setor, itens, total });
    const resp = await fetch("/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, setor, itens, total })
    });
    const data = await resp.json();
    console.log("✅ Resposta do backend:", data);

    if (data.success) {
      // abre WhatsApp (compatível com celular e desktop)
      const url = `https://api.whatsapp.com/send?phone=${numero}&text=${mensagem}`;
      window.location.href = url;

      carregarEstoque(); // recarrega estoque
    } else {
      alert("❌ Erro: não foi possível registrar o pedido.");
    }
  } catch (err) {
    console.error("❌ Erro ao enviar pedido:", err);
    alert("Falha na conexão com o servidor.");
  }
});

// 🚀 Carrega estoque ao abrir
carregarEstoque();
