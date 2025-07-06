♻️ re-ciclo
Plataforma de serviços de reciclagem, que tem como objetivo mapear as empresas geradoras de Resíduos de Equipamentos Eletroeletrônicos (REEE). E disponibilizar informações de coletas para centros de reciclagem, para que esses centros trabalhem com esses residuos,
reutilazando, reciclando ou fazendo o descarte correto. A plataforma pode ser também acessada pela população, com a finalizadade de informar e conscientizar sobre o REEE, além de informar as empreas recebedoras desses materias.


🛠️ Tecnologias
Frontend: React, HTML, CSS, JavaScript

Backend: Node.js, Express

Banco de Dados: MongoDB (Mongoose)

Autenticação: JWT, bcryptjs

Outras Dependências: CORS, Nodemailer, Validator, Dotenv

🚀 Como rodar o projeto localmente
📋 Pré-requisitos
Node.js (v18 ou superior)

npm ou yarn

MongoDB (local ou Atlas)

🔧 Configuração do Backend
Instale as dependências:

bash
cd backend/  # Entre na pasta do backend (se aplicável)
npm install express mongoose bcryptjs jsonwebtoken cors dotenv validator nodemailer
Configure as variáveis de ambiente:

Crie um arquivo .env na pasta do backend com:

env
MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
EMAIL_USER=seu_email_para_recuperacao
EMAIL_PASS=sua_senha_de_email
PORT=5000  # Ou a porta desejada

Inicie o servidor:

bash
node server.js
# Ou com nodemon (se instalado):
npm run dev
O backend estará em: http://localhost:5000 (ou a porta definida).

💻 Configuração do Frontend (React)
Instale as dependências:

bash
cd frontend/  # Entre na pasta do frontend (se aplicável)
npm install
Configure a URL da API:

No arquivo src/services/api.js (ou similar), defina:

javascript
baseURL: "http://localhost:5000"  # Ajuste para a URL do seu backend
Inicie o React:

bash
npm start
Acesse: http://localhost:3000.