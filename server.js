import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Criar servidor HTTP
const httpServer = createServer(app);

// Configuração do Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Em produção, defina seu domínio específico
        methods: ["GET", "POST"]
    }
});

// Lógica do Socket.IO
io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    // Evento quando um usuário define seu nome
    socket.on('set username', (username) => {
        socket.username = username.username;
        console.log(`Usuário ${socket.id} definiu nome: ${username.username}`);
        socket.emit('username accepted');
    });

    // Evento de mensagem de chat
    socket.on('chat message', (msg) => {
        if (!socket.username) {
            return socket.emit('error', 'Defina um nome de usuário primeiro');
        }

        const messageData = {
            user: socket.username,
            text: msg,
            time: new Date().toLocaleTimeString(),
            id: socket.id
        };

        io.emit('chat message', messageData); // Envia para todos
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        if (socket.username) {
            io.emit('user left', socket.username);
        }
    });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});