const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// FastAPI 서버 URL (ngrok URL로 변경 필요)
const API_URL = 'https://6dec-34-91-33-175.ngrok-free.app/predict';

app.post('/api/chat', async (req, res) => {
    try {
        console.log('Sending request to:', API_URL);
        console.log('Request body:', req.body);
        
        const response = await axios.post(API_URL, {
            question: req.body.message,
            language: 'ko' // 한국어 응답 요청
        });
        
        console.log('Response from API:', response.data);
        
        // API 응답을 한글로만 받도록 처리
        let answer = response.data.answer || response.data.response || response.data;
        
        // 영어가 포함된 경우 한글로 번역하는 로직 추가
        if (typeof answer === 'string' && /[a-zA-Z]/.test(answer)) {
            // 여기서 번역 API를 사용하거나, 
            // FastAPI 서버에서 한글로만 응답하도록 수정이 필요합니다
            answer = answer.replace(/[a-zA-Z]/g, '').trim(); // 임시로 영어 제거
        }
        
        res.json({ answer });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ error: '서버 통신 중 오류가 발생했습니다.' });
    }
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 