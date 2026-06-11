const express = require('express');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let activeSock = null;

async function getSocket() {
    if (activeSock && activeSock.user) return activeSock;
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        connectTimeoutMs: 60000
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log('✅ Bot ready');
    });
    activeSock = sock;
    return sock;
}

// Pairing API
app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    if (!number || !/^\d{10,15}$/.test(number)) {
        return res.status(400).json({ error: 'Invalid number (use country code + digits)' });
    }
    try {
        const sock = await getSocket();
        const code = await sock.requestPairingCode(number);
        res.json({ success: true, code });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// شروع کریں
app.listen(PORT, () => {
    console.log(`🌐 Web UI: http://localhost:${PORT}`);
});

// اپنے اصل bot کو بھی چلائیں (اگر آپ چاہیں کہ دونوں ایک ساتھ چلیں)
// نیچے دیے گئے طریقہ سے آپ index.js کو import کر سکتے ہیں لیکن احتیاط سے
// بہتر ہے کہ آپ index.js کو ایک فنکشن کے طور پر export کریں۔
// مختصراً: آپ یہاں اپنے اصلی bot کو start کرنے کے لیے require('./index') کر سکتے ہیں
// لیکن index.js میں تبدیلی کی ضرورت ہوگی۔ میں آسان طریقہ بتاتا ہوں:
try {
    require('./index');  // یہ آپ کے موجودہ bot کو چلائے گا (اگر اس میں کوئی لوپ نہ ہو)
} catch(e) {
    console.log('Main bot not loaded separately, will run in background');
}