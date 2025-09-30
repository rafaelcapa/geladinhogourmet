document.addEventListener("DOMContentLoaded", () => {
  const listaPedidos = document.getElementById("lista-pedidos");
  const btnCarregar = document.getElementById("btn-carregar");

  async function carregarPedidos() {
    try {
      const response = await fetch("/pedidos");
      const pedidos = await response.json();

      listaPedidos.innerHTML = "";

      if (pedidos.length === 0) {
        listaPedidos.innerHTML = "<p>Nenhum pedido recebido ainda.</p>";
        return;
      }

      pedidos.forEach(pedido => {
        const div = document.createElement("div");
        div.classList.add("pedido");

        // Cabeçalho: Nome + Setor (se informado)
        let header = `${pedido.nome}`;
        if (pedido.setor && pedido.setor.trim() !== "") {
          header += ` (Setor ${pedido.setor})`;
        }

        // Lista de itens
        let itens = pedido.itens
          .map(item => `- ${item.qtd}x ${item.nome}`)
          .join("<br>");

        // Total formatado
        let total = `Total: R$ ${pedido.total.toFixed(2)}`;

        // Montagem final
        div.innerHTML = `
          <strong>${header}</strong><br>
          ${itens}<br>
          <em>${total}</em>
        `;

        listaPedidos.appendChild(div);
      });
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      listaPedidos.innerHTML = "<p>Erro ao carregar pedidos.</p>";
    }
  }

  // Carregar ao abrir
  carregarPedidos();

  // Botão para atualizar manualmente
  if (btnCarregar) {
    btnCarregar.addEventListener("click", carregarPedidos);
  }
});

