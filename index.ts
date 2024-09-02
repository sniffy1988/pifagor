import {Bot, Context, InlineKeyboard} from "grammy";
import * as url from "node:url";
const fs = require('fs');
const fileUrl = './leaderboard.json';

const leadUsers = () => {
    if(fs.existsSync(fileUrl)) {
        const fileContent = fs.readFileSync(fileUrl);
        if(fileContent.length) {
            const usersFromFile = JSON.parse(fileContent);
            if(usersFromFile.length) {
                return usersFromFile;
            }
        }

    }
    return []
}

const saveUsers = () => {
    if(fs.existsSync(fileUrl)) {
        const json = JSON.stringify(users);
        fs.writeFileSync(fileUrl, json);
    }
}

const users: User[] = leadUsers();

const token = '7126783978:AAHKGXERSXCa9rYRRlnD42Vu76prZXp55Hw';

const bot = new Bot(token);

type User = {
    id: number
    name: string
    points: number
}

type Question = {
    firstNumber: number
    secondNumber: number
}

let currentQuestion: any = null;

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


const isUserPlayed = (id: number) => {
    return users.findIndex(user => user.id === id) !== -1;
}

const createUser = (id: number, firstName: string) => {
    users.push({
        id: id,
        name: firstName,
        points: 0
    })
}

const addPoints = (userId: number) => {
    const user = getUserById(userId);
    if(user) {
        user.points += 10;
        saveUsers();
    }
}

const getUserById = (id: number) => {
    return users.find(user => user.id === id) || null;
}

const callbackDataGenerator = (firstNumber: string, secondNumber: string, answer: string) => {
    return `question_${firstNumber}_${secondNumber}_${answer}`;
}

const questionGenerator = () => {
    const question: Question = {
        firstNumber: getRandomInt(1, 10),
        secondNumber: getRandomInt(1, 10),
    }
    const keyboard = new InlineKeyboard();

    const randomAnswer1 = getRandomInt(1, 100).toString();
    const randomAnswer2 = getRandomInt(1, 100).toString();

    const answers = [
        randomAnswer1,
        (question.firstNumber * question.secondNumber).toString(),
        randomAnswer2
    ];

    const randomAnswers = shuffleArray(answers);

    for (const randomAnswer of randomAnswers) {
        keyboard.text(randomAnswer, callbackDataGenerator(question.firstNumber.toString(), question.secondNumber.toString(), randomAnswer));
    }

    return {
        question: question,
        text: `Скільки буде: \n ${question.firstNumber} * ${question.secondNumber} :`,
        answer: question.firstNumber * question.secondNumber,
        keyboard
    }
}

const startGame = async (ctx: Context) => {
    const userId = ctx.from?.id || 0;
    const firstName = ctx.from?.first_name || '';
    if (!isUserPlayed(userId)) {
        createUser(userId, firstName);
    }

    const newQuestion = questionGenerator();
    currentQuestion = newQuestion;
    await bot.api.sendSticker(userId, 'https://sl.combot.org/hhpppotter/webp/25xf09f98b1.webp');

    await ctx.reply(newQuestion.text, {parse_mode: "HTML", reply_markup: newQuestion.keyboard});
}

bot.command('start', (ctx) => {
    ctx.reply('Hello');
});

bot.command('game',  (ctx) => {
    startGame(ctx);
});

bot.command('english',  (ctx) => {
    ctx.reply('https://us04web.zoom.us/j/74850557245?pwd=zDYuHyJIYUOs3MDGnf4O8f19tKVbmH.1');
});

bot.command('class',  (ctx) => {
    ctx.reply('https://us05web.zoom.us/j/3237947064?pwd=MkQ2WHNHNHNRcW9ZODRocVdQMml2dz09');

});

bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    if(data === 'start_new') {
        startGame(ctx);
        return await ctx.answerCallbackQuery();
    } else {
        console.log('call', data);
        const answer = data.split('_');
        const firstNumber = parseInt(answer[1]);
        const secondNumber = parseInt(answer[2]);
        const userId = ctx.from?.id || 0;
        const user = getUserById(userId);

        if (currentQuestion !== null && firstNumber === currentQuestion.question.firstNumber && secondNumber === currentQuestion.question.secondNumber) {
            if (parseInt(answer[1]) * parseInt(answer[2]) !== parseInt(answer[3])) {
                await bot.api.sendSticker(userId, 'https://sl.combot.org/hhpppotter/webp/27xf09fa4a3.webp');

                await ctx.reply('Неправильно!');
            } else {
                if(user) {
                    await bot.api.sendSticker(userId, 'https://sl.combot.org/hhpppotter/webp/2xf09f918d.webp');

                    await ctx.reply('Правильно! + 10 очок Гріфіндору!');
                    addPoints(userId);

                }
            }
            currentQuestion = null;
            const keyboard = new InlineKeyboard();
            keyboard.text('Нова гра', 'start_new')
            await ctx.reply('Ще раз?', {reply_markup: keyboard});
            return await ctx.answerCallbackQuery();
        }
    }
});

bot.command('leaderboard', async (ctx) => {
    const userId = ctx.from?.id || 0;
    const user = getUserById(userId);
    if (user) {
        await bot.api.sendSticker(userId, 'https://sl.combot.org/hhpppotter/webp/3xf09f9982.webp');
        await ctx.reply(`У тебе ${user.points} очок`);
    } else {
        await bot.api.sendSticker(userId, 'https://sl.combot.org/hhpppotter/webp/3xf09f9982.webp');
        await ctx.reply('У тебе ще немає очок');
    }
})

bot.api.setMyCommands([
    {
        command: 'start',
        description: 'Start the bot.',
    },
    {
        command: 'game',
        description: 'Почати гру',
    },
    {
        command: 'leaderboard',
        description: 'Узнати скільки у мене очок'
    },
    {
        command: 'english',
        description: 'Англійська мова'
    },
    {
        command: 'class',
        description: 'Світлана Семенівна'
    }
]);

bot.start();

export default bot;