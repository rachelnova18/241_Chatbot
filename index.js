const express = require('express');
const dotenv = require('dotenv');
const dns = require('dns');

// SOLUSI ENOTFOUND: Memaksa Node.js menggunakan IPv4 terlebih dahulu
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: "Messages harus berupa array"
            });
        }

        const response = await fetch(
            "https://api.openrouter.ai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
                },
                body: JSON.stringify({
                    model: "inclusionai/ling-3.2-flash:free",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: true
                })
            }
        );
        
        
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});