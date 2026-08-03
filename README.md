# BizFlow Dashboard

Crie uma aplicação web moderna e funcional estilo Dashboard Admin para gestão de clientes, produtos e criação de orçamentos.

1. Navegação e Layout:

- Layout com menu lateral (Sidebar) expansível e responsivo.

- Navegação entre 4 seções principais: "Dashboard", "Clientes", "Itens/Produtos" e "Orçamentos".

- Design limpo, profissional, moderno e com boa legibilidade. Use uma paleta de cores neutras (cinza claro/escuro) com detalhes em azul ou verde para botões de ação principal.

2. Módulo de Clientes:

- Tela com lista de clientes em formato de tabela ou cards.

- Botão "Adicionar Novo Cliente" que abre um modal ou formulário com os campos: Nome Completo, E-mail, Telefone, Endereço e Observações.

- Opção para editar e excluir clientes.

3. Módulo de Itens / Produtos:

- Tela com grade ou tabela dos itens cadastrados.

- Cada item deve exibir: Imagem do produto, Nome/Título, Descrição e Preço unitário.

- Form/Modal de cadastro de item com:

  - Upload/Insira URL da imagem (com preview em tempo real).

  - Nome do Item.

  - Descrição detalhada.

  - Valor unitário.

- Opção para editar e excluir itens.

4. Módulo de Orçamentos:

- Lista de orçamentos já criados (com status: Pendente, Aprovado, Recusado).

- Botão "Criar Novo Orçamento" que abre um construtor de orçamento contendo:

  - Seleção do Cliente (drop-down puxando os clientes cadastrados).

  - Data e Validade do orçamento.

  - Seção para adicionar itens ao orçamento: selecione o item cadastrado, veja a thumbnail/imagem dele, a descrição e ajuste a quantidade (com cálculo automático do valor total por item e do orçamento completo).

  - Campo para observações/condições de pagamento.

  - Visualização final do orçamento em formato de documento/fatura, pronto para impressão ou exportação em PDF, exibindo as imagens dos produtos selecionados, dados do cliente e totalizador.

5. UX/UI & Interatividade:

- Feedback visual ao salvar, editar ou deletar itens (toasts/notificações).

- Estado inicial (Empty state) elegante para quando não houver clientes ou produtos cadastrados ainda.

- Layout totalmente responsivo para desktop e mobile.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/666641a2-63a3-4acb-91b1-9a61c48b30ae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
