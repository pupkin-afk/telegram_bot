const token = '1715907633:AAHX-P9BF7WefWoMSGtsOz8d4ZmcgyNWlgo'
const TelegramBot = require('node-telegram-bot-api');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

let keyboard = [
    [
        {
            text: 'Вигук',
            callback_data: 's_vugyk'
        },

        {
            text: 'Прийменник',
            callback_data: 's_priymennik'
        },
        {
            text: 'Сполучник',
            callback_data: 's_spolychnik'
        },
        {
            text: 'Частка',
            callback_data: 's_chastka'
        },
    ]
]

const languages = require('./languages.js')
var games = {}

//bot.on("polling_error", console.log);

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    function send(d) {
        bot.sendMessage(chatId, 'Виберіть варіант:', {reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Правило 📕', callback_data: 'rule_' + d},
                    {text: 'Слова 💬', callback_data: 'words_' + d},
                    {text: 'Тести 💥', callback_data: 'check_' + d}
                    
                ]
            ]
        }})
    }

    // rule
    if (query.data.startsWith('rule_')) {
        let lang = query.data.split('rule_')[1]
        let info = languages[lang]

        bot.sendMessage(chatId, info.rule, {parse_mode: 'Markdown'})
    }
    // words
    if (query.data.startsWith('words_')) {
        let lang = query.data.split('words_')[1]
        let info = languages[lang]

        bot.sendMessage(chatId, info.words, {parse_mode: 'Markdown'})
    }
    // check
    if (query.data.startsWith('check_')) {
        let lang = query.data.split('check_')[1]
        let info = languages[lang]
        let k = chatId.toString()

        if (!games[k]) {
            games[k] = {
                part: lang,
                start: Date.now()
            }
        }

        bot.sendMessage(chatId, `
Напишіть всі слова із частини мови '*${info.name}*'.
Всього: ${info.test.length},
*УВАГА!* Треба писати через кому та пропуск, наприклад: слово1, слово2
`, {parse_mode: 'Markdown'})
    }

    // select
    if (query.data.startsWith('s_')) {
        send(query.data)
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text

    let arguments = text.split(' ')
    let k = chatId.toString()

    if (games[k]) {
        let i = games[k]
        let info = languages[i.part]
        let correct = 0
        let maxCorrect = info.test.length
        let time = Math.round((Date.now() - i.start) / 1000)
        let writed = 0

        let answ = text.split(', ')

        let cache = {}

        for (let c = 0; c < answ.length; c++) {
            let word = answ[c]
            if (word) {
                writed += 1
                word = word.toLocaleLowerCase()

                if (info.test.includes(word) && !cache[word]) {
                    cache[word] = true
                    correct += 1
                }
            }
        }

        let res = `
Ви впоралися за ${time} секунд!
Правильно: *${correct}*/*${maxCorrect}*, ${Math.round(correct / maxCorrect * 100)}%, ${Math.round((correct / maxCorrect) * 12)} балів(-а).
Ви написали слів: *${writed}*/*${maxCorrect}*
        `

        bot.sendMessage(chatId, res, {parse_mode: 'Markdown'})
        games[k] = null
        return
    }

    if (arguments[0] == '/select') {
        bot.sendMessage(chatId, 'Виберіть варіант:', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        })
    }
    else if (arguments[0] == '/help') {
        let res = '*КОМАНДИ*\n'

        res += '1. Выбрати частину мови /select'

        bot.sendMessage(chatId, res, {parse_mode: 'Markdown'})
    }
    else {
        bot.sendMessage(chatId, 'Невідома команда. Для допомоги введіть /help')
    }
});