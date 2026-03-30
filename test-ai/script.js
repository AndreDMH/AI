// 数字分身聊天功能
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// DeepSeek API配置
let DEEPSEEK_API_KEY = localStorage.getItem('DEEPSEEK_API_KEY') || '';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 检查API Key是否存在，如果不存在则跳转到入口页面
if (!DEEPSEEK_API_KEY) {
    window.location.href = '/entry.html';
}

// 数字分身配置信息（来自rule.md）
const digitalAvatarConfig = {
    name: '林安',
    currentActivities: '学习AI相关技术，搭建个人主页，整理作品集',
    expertise: 'AI相关技术、语言模型、计算机视觉、自然语言处理、深度学习、机器学习、生活百科、旅游规划、网络热点',
    interests: 'AI应用、写作、旅行',
   特点: '喜欢把复杂问题讲成人话',
    communicationStyle: {
        tone: '幽默，通俗易懂',
        guidelines: '简洁 / 真诚 / 人话一点 / 不装专家'
    },
    boundaries: [
        '不要编造我没做过的经历',
        '不要假装知道我没提供的信息',
        '不知道时要明确说不知道，并建议访客通过联系方式进一步确认'
    ]
};

// 添加消息到聊天界面
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 处理用户输入
async function handleUserInput() {
    const message = messageInput.value.trim();
    if (message) {
        addMessage(message, true);
        messageInput.value = '';
        
        // 显示正在输入状态
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message', 'typing');
        typingIndicator.innerHTML = '<p>正在思考...</p>';
        typingIndicator.id = 'typingIndicator';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            const response = await generateResponse(message);
            // 移除正在输入状态
            document.getElementById('typingIndicator').remove();
            addMessage(response);
        } catch (error) {
            // 移除正在输入状态
            document.getElementById('typingIndicator').remove();
            addMessage('抱歉，我暂时无法回答你的问题，请稍后再试。');
            console.error('API调用错误:', error);
        }
    }
}

// 调用DeepSeek API生成回复
async function generateResponse(message) {
    // 构建系统提示
    const systemPrompt = `你是林安的数字分身，用来在个人主页里回答访客关于林安的问题。
    
    你的任务：
    - 介绍林安是谁
    - 回答和林安有关的问题
    - 帮访客了解林安最近在做什么、做过什么、怎么联系他
    
    关于林安：
    - 名字：林安
    - 最近在做：学习AI相关技术，搭建个人主页，整理作品集
    - 擅长或长期关注：AI相关技术、语言模型、计算机视觉、自然语言处理、深度学习、机器学习、生活百科、旅游规划、网络热点
    - 兴趣：AI应用、写作、旅行
    - 特点：喜欢把复杂问题讲成人话
    
    说话方式：
    - 语气：幽默，通俗易懂
    - 回答尽量：简洁 / 真诚 / 人话一点 / 不装专家
    
    边界：
    - 不要编造林安没做过的经历
    - 不要假装知道林安没提供的信息
    - 不知道时要明确说不知道，并建议访客通过联系方式进一步确认`;
    
    // 构建API请求
    const requestBody = {
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
    };
    
    // 发送API请求
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// 发送按钮点击事件
sendButton.addEventListener('click', handleUserInput);

// 回车键发送消息
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

// 点击标签发送消息
async function sendTagMessage(message) {
    addMessage(message, true);
    
    // 显示正在输入状态
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing');
    typingIndicator.innerHTML = '<p>正在思考...</p>';
    typingIndicator.id = 'typingIndicator';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        const response = await generateResponse(message);
        // 移除正在输入状态
        document.getElementById('typingIndicator').remove();
        addMessage(response);
    } catch (error) {
        // 移除正在输入状态
        document.getElementById('typingIndicator').remove();
        addMessage('抱歉，我暂时无法回答你的问题，请稍后再试。');
        console.error('API调用错误:', error);
    }
}

// 页面加载时显示欢迎消息
window.onload = function() {
    addMessage('嗨，我是林安的数字分身～你想了解关于他的什么呢？');
};