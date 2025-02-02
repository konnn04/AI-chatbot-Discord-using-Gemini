const {
    GoogleGenerativeAI,
    HarmCategory,
    DynamicRetrievalMode,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const axios = require("axios");
const readCSVFile = require("./read_file");

const DATA_PATH = "./src/data/data.csv";
const MAX_RECENT_MESSAGES = 100;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const recentMessages = new Map();
const recentAttachments = new Map();
const cooldown = new Map();

const { sendDebug } = require("./debug");

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    region: "asia-east1",
    tools: [
        {
            googleSearch: {
                dynamicRetrievalMode: DynamicRetrievalMode.ENABLED,
                harmCategory: HarmCategory.VERY_LIKELY,
                harmBlockThreshold: HarmBlockThreshold.HIGH,
            },
        },
    ],
});

const generationConfig = {
    temperature: 0.4,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const senderDefault = `[Riikon | root - Admin - konnn]`

const histories = [
    {
        'role': 'user',
        'parts': [
            {
                'text': `${senderDefault} : Em là một trợ lý ảo AI cho ứng dụng Discord. Em sẽ giúp đỡ mọi người trong nhóm chat discord với kiến thức của mình. Từ giờ khi role "Admin" dạy em một câu hỏi, em sẽ học và trả lời cho role "User". Nếu em hiểu câu hỏi của role "User", hãy trả lời ngay theo những gì role "Admin" chỉ dạy. Nếu không hiểu, thì từ chối trả lời và hỏi role "Admin". em sẽ học từ role "Admin" và "User" để trả lời câu hỏi sau này. Cấu trúc của một câu hỏi sẽ là [<channel> - <role> - <name>] <question>. Với <channel> là tên kênh của kênh chat, <role> là vai trò người tương tác và <name> là tên người tương tác. Ví dụ: [root - admin - admin001] : Em là ai?. Khi "admin" dạy em một câu hỏi, hãy trả lời "Đã hiểu rồi ạ!" để bắt đầu học. Em sẽ tạo nhiều part trả lời nếu câu trả lời quá dài (không quá 1500 ký tự). Mỗi part nếu dài sẽ cắt ra bằng cách xuống dòng 2 lần thông thường. Ví dụ: part1 \n\n part2`
            }
        ]
    },
    {
        'role': 'model',
        'parts': [
            {
                'text': 'Đã hiểu rồi ạ!'
            }
        ]
    }
]


// console.log(histories);

const chatSessions = new Map();

async function createChatSession(guildId) {
    const historiesCopy = JSON.parse(JSON.stringify(histories));
    historiesCopy.push(...await importData(DATA_PATH));
    console.log("Creating chat session for guild: " + guildId);
    // console.log(historiesCopy);
    const chatSession = await model.startChat({
        generationConfig,
        history: historiesCopy,
    });
    chatSessions.set(guildId, chatSession);
    recentMessages.set(guildId, []);
    recentAttachments.set(guildId, []);
    return {
        status: "success",
    }
}

async function checkSessionChat(guildId) {
    if (!chatSessions.has(guildId)) {
        await createChatSession(guildId);
    }
    return {
        status: "success",
    }
}

async function addRecentMessage(guildId, messageContent, name, channel) {
    if (!chatSessions.has(guildId)) {
        await createChatSession(guildId);
    }
    const recentMessages_ = recentMessages.get(guildId);
    recentMessages_.push(`[${channel} - ${name}] : ${messageContent}`);
    if (recentMessages_.length >= MAX_RECENT_MESSAGES) {
        recentMessages_.shift();
    }
    recentMessages.set(guildId, recentMessages_);
    return {
        status: "success",
    }
}

const aiChat = async (guildId, messageContent, name = "Người dùng", channel = "root") => {
    // Kiểm tra xem có session chat nào chưa
    if (!chatSessions.has(guildId)) {
        await createChatSession(guildId);
    }
    // Kiểm tra cooldown
    if (cooldown.has(guildId) && cooldown.get(guildId) > Date.now()) {
        return {
            contents: ["Chờ xíu em trả lời câu hỏi trước đã nào!"],
            private: true,
        }
    }
    // Lấy session chat
    const chatSession = chatSessions.get(guildId);
    // console.log(`[${channel} - user - ${name}] input: ${messageContent}`);

    // #######################################################################
    const promts = []
    recentMessages.get(guildId).forEach((message) => {
        promts.push(message);
    });
    recentMessages.set(guildId, []);
    // #######################################################################
    const attachments = recentAttachments.get(guildId);
    if (attachments.length > 0) {
        attachments.forEach((attachment) => {
            promts.push(attachment);
        });
        recentAttachments.set(guildId, []);
    }
    promts.push(`[${channel} - user - ${name}] input: ${messageContent}`);
    // #######################################################################
    console.log(promts);
    const response = await chatSession.sendMessage(promts);
    const contents = []
    response.response.candidates[0].content.parts.forEach((part) => {
        if (part.text.length > 1500 && !part.text.includes('```')) {
            const parts = part.text.split('\n\n');
            parts.forEach((text) => {
                contents.push(text);
            });
        }else{
            contents.push(part.text);
        }
    });
    // console.log(response.response.candidates)
    cooldown.set(guildId, Date.now() + 5000);
    return {
        contents: contents,
        private: false,
    }
}

async function importData(path_) {
    const h = []
    return await new Promise(async (resolve, reject) => {
        try {
            const data = await readCSVFile(path_);
            data.forEach((e, i) => {
                h.push({
                    'role': 'user',
                    'parts': [
                        {
                            'text': `[Riikon - ${e[2]} - ${e[3]}] : ` + e[0]
                        }
                    ]
                },
                    {
                        'role': 'model',
                        'parts': [
                            {
                                'text': e[1]
                            }
                        ]
                    });
            })
            console.log("Data imported successfully!");
            resolve(h);
        } catch (error) {
            console.log("Data import failed!");
            sendDebug("Data import failed!\n" + error);
            reject([]);
            console.log(error);
        }
    });
}

async function addRecentAttachments(guildId, attachments_, name, channel) {
    const attachments = []
    attachments_.forEach(async (attachment) => {
        await fileToGenerativePart(attachment.url, attachment.contentType).then((part) => {
            if (part !== null) {
                attachments.push(part)
            }
        }
        );
    });
    recentAttachments.set(guildId, attachments);
}

async function fileToGenerativePart(url, contentType) {
    //Nhận ảnh và tài liệu từ message của user
    if (
        !contentType.includes('image') &&
        !contentType.includes('pdf') &&
        !contentType.includes('video') &&
        !contentType.includes('text/') &&
        !contentType.includes('audio')
    ) return null;
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'binary')
    const base64 = buffer.toString('base64')
    return {
        inlineData: {
            data: base64,
            mimeType: contentType
        },
    };
}

module.exports.aiChat = aiChat;
module.exports.addRecentMessage = addRecentMessage;
module.exports.addRecentAttachments = addRecentAttachments;
module.exports.checkSessionChat = checkSessionChat;
module.exports.createChatSession = createChatSession;




