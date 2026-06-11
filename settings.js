// ✅ MegaTron Bot Stylish Configuration – by 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 ❦ ✓

const ownerNumber = require('./Owner/owner'); // 🔗 Example: ['923457116587']

const config = {
  // 👑 Owner Info
  ownerNumber,                          // 🔹 Array of Owner Numbers
  ownerName: '𓆩 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 ❦︎𓆪',              // 🔹 Displayed in Greetings
  botName: '🤖 𝗠𝗘𝗚𝗔𝐓𝐑𝐎𝐍 𝑩𝑶𝑻 ⚡',           // 🔹 Bot Display Name
  signature: '> 𝐙𝐔𝐋𝐐𝐀𝐑𝐍𝐀𝐈𝐍 ❦ ✓',               // 🔹 Footer on Bot Replies
  youtube: 'https://www.youtube.com/@zxh-official', // 🔹 Optional YouTube

  // ⚙️ Feature Toggles
  autoTyping: true,        // ⌨️ Fake Typing
  autoReact: true,         // 💖 Auto Emoji Reaction
  autoStatusView: true,    // 👁️ Auto-View Status
  public: true,             // 🌍 Public or Private Mode
  antiLink: false,          // 🚫 Delete Links in Groups
  antiBug: false,           // 🛡️ Prevent Malicious Crashes
  greetings: true,          // 🙋 Welcome/Farewell Messages
  readmore: true,          // 📜 Readmore in Long Replies
  ANTIDELETE: true          // 🗑️ Anti-Delete Messages
};

// ✅ Register owner(s) globally in WhatsApp JID format
global.owner = (
  Array.isArray(ownerNumber) ? ownerNumber : [ownerNumber]
).map(num => num.replace(/\D/g, '') + '@s.whatsapp.net');

// ⚙️ Export Settings Loader
function loadSettings() {
  return config;
}

module.exports = { loadSettings };