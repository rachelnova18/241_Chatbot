const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Menyimpan riwayat chat agar AI memiliki konteks percakapan sebelumnya
let messagesHistory = [];

// Fungsi untuk menambahkan chat ke UI
function appendMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);
    
    // Auto-scroll ke bawah
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return bubble; 
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan pesan user ke layar
    appendMessage('user', text);
    userInput.value = '';
    
    // 2. Simpan ke riwayat
    messagesHistory.push({ role: 'user', content: text });

    // 3. Buat bubble kosong untuk balasan AI yang akan di-stream
    const botBubble = appendMessage('bot', '');
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messagesHistory })
        });

        if (!response.ok) {
            throw new Error("Gagal menghubungi server");
        }

        // 4. Proses membaca data streaming (SSE)
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botFullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
                    continue;
                }

                const dataStr = trimmedLine.slice(6).trim();
                
                if (dataStr === '[DONE]') {
                    continue;
                }

                try {
                    // Karena backend Anda mengirim dengan JSON.stringify(content),
                    // kita perlu me-parse JSON tersebut untuk mendapatkan string aslinya.
                    const textChunk = JSON.parse(dataStr);
                    botFullText += textChunk;
                    botBubble.textContent = botFullText; // Update teks di layar
                    chatBox.scrollTop = chatBox.scrollHeight;
                } catch (e) {
                    console.error("Gagal parse chunk:", e);
                }
            }
        }

        // 5. Simpan balasan utuh AI ke riwayat
        messagesHistory.push({ role: 'assistant', content: botFullText });

    } catch (error) {
        console.error("Error:", error);
        botBubble.textContent = "Maaf, terjadi kesalahan pada server.";
        botBubble.style.color = "red";
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Kirim jika tombol ditekan
sendBtn.addEventListener('click', sendMessage);

// Kirim jika tombol Enter ditekan pada keyboard
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});