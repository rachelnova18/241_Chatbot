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
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error("OpenRouter error:", errorData);
            return res.status(response.status).json({ error: errorData });
        }

        // Header untuk streaming (Server-Sent Events)
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";


app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});