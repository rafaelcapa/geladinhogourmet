let logado = false;

function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, pass })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        logado = true;
        document.getElementById("login").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        carregarEstoque();
        carregarPedidos();
      } else {
        document.getElementById("loginMsg").innerText = "Usuário ou senha inválidos";
      }
    });
}

function carregarEstoque() {
  fetch("/estoque")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#estoqueTabela tbody");
      tbody.innerHTML = "";
      data.forEach((item, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><input type="text" value="${item.nome}"></td>
          <td><input type="number" value="${item.preco}" min="0"></td>
          <td><input type="number" value="${item.qtd}" min="0"></td>
          <td><button onclick="removerLinha(${i})">❌</button></td>
        `;
        tbody.appendChild(row);
      });
    });
}

function salvarEstoque() {
  const linhas = document.querySelectorAll("#estoqueTabela tbody tr");
  const estoque = [];
  linhas.forEach(row => {
    const inputs = row.querySelectorAll("input");
    estoque.push({
      nome: inputs[0].value,
      preco: parseFloat(inputs[1].value),
      qtd: parseInt(inputs[2].value)
    });
  });

  fetch("/estoque", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(estoque)
  }).then(() => alert("Estoque atualizado!"));
}

function adicionarLinha() {
  const tbody = document.querySelector("#estoqueTabela tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="Novo sabor"></td>
    <td><input type="number" value="0" min="0"></td>
    <td><input type="number" value="0" min="0"></td>
    <td><button onclick="this.closest('tr').remove()">❌</button></td>
  `;
  tbody.appendChild(row);
}

function removerLinha(index) {
  const tbody = document.querySelector("#estoqueTabela tbody");
  tbody.deleteRow(index);
}

function carregarPedidos() {
  fetch("/pedidos")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaPedidos");
      lista.innerHTML = "";
      data.forEach((pedido, i) => {
        const li = document.createElement("li");
        li.innerText = JSON.stringify(pedido);
        const btn = document.createElement("button");
        btn.innerText = "Apagar";
        btn.onclick = () => apagarPedido(i);
        li.appendChild(btn);
        lista.appendChild(li);
      });
    });
}

function apagarPedido(index) {
  fetch(`/pedidos/${index}`, { method: "DELETE" })
    .then(() => carregarPedidos());
}
