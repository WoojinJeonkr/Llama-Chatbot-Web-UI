const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    try {
        const { message, serverUrl } = req.body;
        
        if (!serverUrl) {
            return res.status(400).json({ error: '서버 URL이 설정되지 않았습니다.' });
        }

        console.log('Sending request to:', serverUrl);
        console.log('Request body:', { question: message });
        
        const response = await axios.post(serverUrl, {
            question: message
        });
        
        console.log('Response from API:', response.data);
        
        res.json({
            answer: response.data.answer || response.data.response || response.data
        });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ error: '서버 통신 중 오류가 발생했습니다.' });
    }
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 