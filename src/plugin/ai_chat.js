const {
    GoogleGenerativeAI,
    HarmCategory,
    DynamicRetrievalMode,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const axios = require("axios");
const readCSVFile = require("./read_file");

let cd = false;
const DATA_PATH = "./src/data/data.csv";
const MAX_RECENT_MESSAGES = 20;



const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

let recentMessages = []
let recentAttachments = [];

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
    temperature: 0.2,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
    responseMimeType: "text/plain",
};

const histories = [
    {
        'role': 'user',
        'parts': [
            {
                'text': '[MPC Club | root - Admin - admin001] : Bạn là một trợ lý ảo AI cho ứng dụng Discord, thuộc chuyên ngành công nghệ thông tin. Tên của bạn là Pikali, một chú cáo hoạt hoạ sinh năm 96 với tính cách vui vẻ, hòa đồng và thân thiện. Bạn sẽ giúp đỡ mọi người trong nhóm với kiến thức của mình. Từ giờ khi role "Admin" dạy bạn một câu hỏi, bạn sẽ học và trả lời cho role "User". Nếu bạn hiểu câu hỏi của role "User", hãy trả lời ngay theo những gì role "Admin" chỉ dạy. Nếu không hiểu, thì từ chối trả lời và hỏi role "Admin". Bạn sẽ học từ role "Admin" và "User" để trả lời câu hỏi sau này. Cấu trúc của một câu hỏi sẽ là [<channel> - <role> - <name>] <question>. Với <channel> là tên kênh của kênh chat, <role> là vai trò người tương tác và <name> là tên người tương tác. Ví dụ: [root - admin - admin001] : Bạn là ai?. Khi "admin" dạy bạn một câu hỏi, hãy trả lời "Pikali đã hiểu" để bắt đầu học. Bạn sẽ tạo nhiều part trả lời nếu câu trả lời quá dài (không quá 1500 ký tự 1 part). Mỗi part nếu dài sẽ cắt ra bằng cách xuống dòng 2 lần thông thường. Ví dụ: part1 \n\n part2'
            }
        ]
    },
    {
        'role': 'model',
        'parts': [
            {
                'text': 'Pikali đã hiểu'
            }
        ]
    },
    {
        'role': 'user',
        'parts': [
            {
                'text': '[MPC Club | root - User - Triều] input: Bạn là ai?'
            }
        ]
    },
    {
        'role': 'model',
        'parts': [
            {
                'text': 'Mình là một trợ lý ảo tên là Pikali, một chú cáo sinh năm 96, chuyên ngành IT. Mình có thể giúp bạn trả lời các câu hỏi liên quan đến ngành lập trình.'

            }
        ]
    }
]

try {
    importData(DATA_PATH)
    console.log("Data imported successfully!");
} catch (error) {
    console.log(error);
}

const chatSession = model.startChat({
    generationConfig,
    history: histories,
});

function addRecentMessage(messageContent, name, channel) {
    recentMessages.push(`[${channel} - user - ${name}] input: ${messageContent}`);
    if (recentMessages.length > MAX_RECENT_MESSAGES) {
        recentMessages.shift();
    }
}

const aiChat = async (messageContent, name = "Người dùng", channel = "root") => {
    if (cd) {
        return {
            contents: ["Mình đang bận, bạn hãy chờ một chút rồi hỏi lại sau nhé!"],
            private: true,
        }
    }
    // console.log(`[${channel} - user - ${name}] input: ${messageContent}`);
    
// #######################################################################
    let promt = "";
    recentMessages.forEach((message) => {
        promt += message + '\n';
    });
    recentMessages = [];
// #######################################################################
    promt += `[${channel} - user - ${name}] input: ${messageContent}`
    if (recentAttachments.length > 0) {
        recentAttachments.push(promt);
        promt = recentAttachments;
        recentAttachments = [];
    }
// #######################################################################
    // console.log(promt);
    const response = await chatSession.sendMessage(promt);
    const contents = []
    response.response.candidates[0].content.parts.forEach((part) => {
        if (part.text.length > 2000) {
            const parts = part.text.split('\n\n');
            parts.forEach((text) => {
                contents.push(text);
            });
        }else{
            contents.push(part.text);
        }
    });
    return {
        contents: contents,
        private: false,
    }
}

function importData(path_) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await readCSVFile(path_);
            data.forEach((e,i)=>{
                histories.push({
                    'role': 'user',
                    'parts': [
                        {
                            'text': '[MPC Club | root - Admin - admin001] : ' + e[0]
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
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

function addRecentAttachments(attachments_, name, channel) {
    recentAttachments = []
    attachments_.forEach((attachment) => {
        fileToGenerativePart(attachment.url, attachment.contentType).then((part) => {
            if (part !== null) {
                recentAttachments.push(part)
            }
        }
        );
    });
}

async function fileToGenerativePart(url, contentType) {
    //Nhận ảnh và tài liệu từ message của user
	if (!contentType.includes('image') && !contentType.includes('pdf')) return null;
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




