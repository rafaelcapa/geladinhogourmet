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
      const valorAtual = parseInt(qtdSelect.value) || 0;
      qtdSelect.innerHTML = "";
      for (let i = 0; i <= maxQtd; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        if (i === valorAtual) opt.selected = true;
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

  // valor inicial da quantidade: 1 no primeiro item, 0 nos demais
  const valorInicialQtd = container.children.length === 0 ? 1 : 0;

  // pega o sabor inicial (primeira opção do select)
  const saborInicial = estoque[0];
  let optionsQtd = "";
  for (let i = 0; i <= saborInicial.qtd; i++) {
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
    wrapper.appendChild(bt
