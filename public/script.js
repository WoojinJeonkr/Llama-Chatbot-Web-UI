document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const serverUrlInput = document.getElementById('server-url');
    const saveUrlButton = document.getElementById('save-url');

    // 저장된 URL 불러오기
    const savedUrl = localStorage.getItem('serverUrl');
    if (savedUrl) {
        serverUrlInput.value = savedUrl;
        setUrlFieldState(false); // URL이 저장되어 있으면 입력 필드 비활성화
        updateButtonToEdit(); // 버튼을 수정 버튼으로 변경
    }

    // URL 입력 필드 상태 설정 함수
    function setUrlFieldState(enabled) {
        serverUrlInput.disabled = !enabled;
        if (enabled) {
            serverUrlInput.focus();
        }
    }

    // 버튼을 수정 버튼으로 변경하는 함수
    function updateButtonToEdit() {
        saveUrlButton.textContent = '수정';
        saveUrlButton.style.backgroundColor = '#e67e22';
        // 기존 이벤트 리스너 제거 후 새로운 이벤트 리스너 추가
        saveUrlButton.removeEventListener('click', saveServerUrl);
        saveUrlButton.addEventListener('click', enableUrlEdit);
    }

    // 버튼을 저장 버튼으로 변경하는 함수
    function updateButtonToSave() {
        saveUrlButton.textContent = '저장';
        saveUrlButton.style.backgroundColor = '#2ecc71';
        // 기존 이벤트 리스너 제거 후 새로운 이벤트 리스너 추가
        saveUrlButton.removeEventListener('click', enableUrlEdit);
        saveUrlButton.addEventListener('click', saveServerUrl);
    }

    // URL 수정 모드 활성화
    function enableUrlEdit() {
        setUrlFieldState(true);
        updateButtonToSave();
    }

    // URL 저장 함수
    function saveServerUrl() {
        let url = serverUrlInput.value.trim();
        
        try {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'http://' + url;
            }
            new URL(url);
            
            // URL 저장
            localStorage.setItem('serverUrl', url);
            
            // 성공 메시지 표시
            const statusDiv = document.createElement('div');
            statusDiv.className = 'url-status success';
            statusDiv.textContent = '서버 URL이 저장되었습니다.';
            document.querySelector('.server-url-container').appendChild(statusDiv);
            
            // 3초 후 메시지 제거
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);

            // 입력 필드 비활성화 및 버튼 상태 변경
            setUrlFieldState(false);
            updateButtonToEdit();
        } catch (error) {
            // 에러 메시지 표시
            const statusDiv = document.createElement('div');
            statusDiv.className = 'url-status error';
            statusDiv.textContent = '올바른 URL을 입력해주세요.';
            document.querySelector('.server-url-container').appendChild(statusDiv);
            
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);
        }
    }

    // 초기 버튼 이벤트 리스너 설정
    if (!savedUrl) {
        saveUrlButton.addEventListener('click', saveServerUrl);
    }

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        // 메시지가 영어를 포함하고 있는지 확인
        if (typeof message === 'string' && /[a-zA-Z]/.test(message)) {
            // 영어를 제거하고 한글만 표시
            message = message.replace(/[a-zA-Z]/g, '').trim();
        }
        
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        const serverUrl = localStorage.getItem('serverUrl');
        if (!serverUrl) {
            addMessage('서버 URL을 먼저 설정해주세요.');
            return;
        }

        addMessage(message, true);
        userInput.value = '';

        const typingIndicator = showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    serverUrl: serverUrl + '/predict'
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            typingIndicator.remove();
            
            if (data.error) {
                addMessage('오류: ' + data.error);
            } else {
                addMessage(data.answer || '응답을 받지 못했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            typingIndicator.remove();
            addMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}); 