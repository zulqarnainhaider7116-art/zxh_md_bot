const express = require('express');
const cors = require('cors');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    Browsers 
} = require('@whiskeysockets/baileys');
const P = require('pino');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let activeSock = null;
let pendingPairingResolvers = new Map();

async function initBotSocket() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'fatal' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 30000
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ Bot is ONLINE and ready');
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Disconnected. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(() => initBotSocket(), 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg) return;
        const jid = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        console.log(`📩 Message from ${jid}: ${text.substring(0, 50)}`);
        
        if (text === '!ping') {
            await sock.sendMessage(jid, { text: '🏓 Pong!' });
        }
    });

    activeSock = sock;
    return sock;
}

app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    if (!number || !/^\d{10,15}$/.test(number)) {
        return res.status(400).json({ error: 'Invalid number format. Use country code + number (e.g., 923001234567)' });
    }

    try {
        if (!activeSock) {
            await initBotSocket();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const sock = activeSock;
        const code = await sock.requestPairingCode(number);
        
        res.json({ 
            success: true, 
            code: code,
            message: 'Pairing code generated successfully'
        });
    } catch (error) {
        console.error('Pairing error:', error);
        res.status(500).json({ 
            error: 'Failed to generate pairing code',
            message: error.message 
        });
    }
});

initBotSocket().catch(console.error);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Web interface: http://localhost:${PORT}`);
});