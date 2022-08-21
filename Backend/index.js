const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const https = require("https");
var { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  menuOption,
  profileOption,
  addBalance,
  balanceManager,
  submitTransaction,
  submitTransactionSupport,
  rulesMenu,
  submitBuyAccountButton,
  addtionalMenu,
  submitBuyFullInfoButton,
  submitTransactionBTC,
  submitTransactionUSDT,
} = require("./options");
const UserModel = require("./user-model.js");
const Catalog = require("./catalog-model.js");
const FullInfoModel = require("./fullinfo-model.js");
const moment = require("moment");
moment.locale("ru");
const PORT = 5000;
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const token = "Here telegram Token";



const bot = new TelegramBot(token, {
  polling: true,
});


const startupMessage = `Here Startup Message`;

app.get("/getAllUser", async (req, res) => {
  let allUsers = await getAllUser();
  res.json(allUsers);
});

app.get("/getAllAccount", async (req, res) => {
  try {
    let allAccountList = await getAccountList();
    res.json(allAccountList);
  } catch (error) {
    console.log(`Error retrieved account list: ${error}`);
  }
});

app.post("/addBalance", async (req, res) => {
  try {
    const userId = req.body.userId;
    const newBalance = req.body.newBalance;
    const typeEdit = req.body.typeEdit;
    await updateUserBalance(userId, newBalance, typeEdit);
    res.json("Balance Updated");
  } catch (error) {
    console.log(`Error Adding Balance: ${error}`);
  }
});

app.get("/getCatalog", async (req, res) => {
  try {
    const catalog = await getCatalogName();
    res.json(catalog);
  } catch (error) {
    console.log(`Error Download Category: ${error}`);
  }
});

app.post("/addAccount", async (req, res) => {
  try {
    const bankingName = req.body.bankingName;
    const Login = req.body.Login;
    const Pass = req.body.Pass;
    const Price = req.body.Price;
    const Info = req.body.Info;
    const prebuyinfo = req.body.prebuyinfo;
    const country = req.body.country;
    await addAccountInCategory(
      bankingName,
      Login,
      Pass,
      Price,
      Info,
      country,
      prebuyinfo
    );
    res.json("Аккаунт успешно был добавлен в базу!");
  } catch (error) {
    console.log(`Error Adding Account in DataBase: ${error}`);
  }
});

app.post("/createCategory", async (req, res) => {
  try {
    const bankingName = req.body.bankingName;
    const country = req.body.country;
    await createCategory(bankingName, country);
    res.json("Каталог успешно создан!");
  } catch (error) {
    console.log(`Error Adding Catalog in DataBase: ${error}`);
  }
});

app.post("/deleteCategory", async (req, res) => {
  try {
    const bankingName = req.body.bankingName;
    await deleteCategory(bankingName);
    res.json("Каталог успешно Удален!");
  } catch (error) {
    console.log(`Error Delete Catalog in DataBase: ${error}`);
  }
});

app.post("/editCategory", async (req, res) => {
  try {
    const oldBankingName = req.body.oldBankingName;
    const newBankingName = req.body.newBankingName;
    await editCategory(oldBankingName, newBankingName);
    res.json("Каталог успешно Изменен!");
  } catch (error) {
    console.log(`Error Edit Catalog in DataBase: ${error}`);
  }
});

app.post("/deleteAccount", async (req, res) => {
  try {
    const selectedAccount = req.body.account;
    const selectedBanking = req.body.bankingName;
    await deleteSelectedAccount(selectedAccount, selectedBanking);
    res.json("Аккаунт успешно Удален!");
  } catch (error) {
    console.log(`Error delete account from database: ${error}`);
  }
});

app.post("/addFullInfo", async (req, res) => {
  try {
    const fullinfo = req.body.fullinfo;
    const state = req.body.state;
    await addFullInfoInCategory(fullinfo, state);
    res.json("Фулка успешно добавлена!");
  } catch (error) {
    console.log(`Error add fullinfo in database: ${error}`);
  }
});

async function deleteSelectedAccount(account, banking) {
  try {
    await Catalog.findOneAndUpdate(
      {
        bankName: banking,
      },
      {
        $pull: {
          account: {
            Login: account,
          },
        },
      }
    );
  } catch (error) {
    console.log(`Error delete account from database function: ${error}`);
  }
}

async function deleteCategory(bankingName) {
  try {
    await Catalog.findOneAndDelete({
      bankName: bankingName,
    });
  } catch (error) {
    console.log(`Error Delete Catalog in DataBase: ${error}`);
  }
}

async function checkUserBalance(chatId) {
  try {
    const findUserBalance = await UserModel.findOne({
      chatId,
    });
    return findUserBalance.balance;
  } catch (error) {
    console.log(`Error Check User Balance: ${error}`);
  }
}

async function deletePurchasedAccount(chatId, Login, Pass, Info, BA, Price) {
  try {
    await Catalog.findOneAndUpdate(
      {
        bankName: BA,
      },
      {
        $pull: {
          account: {
            Login: Login,
            Pass: Pass,
            Info: Info,
            Price: Price,
          },
        },
      }
    );
  } catch (error) {
    console.log(`Error delete purchased account in database: ${error}`);
  }
}

async function submitBuy(
  chatId,
  Login,
  Pass,
  Info,
  BA,
  Price,
  userBalance,
  prebuyinfo
) {
  try {
    const selectedAccountMessage = `
Спасибо за покупку!
===============================
Login: ${Login}
Pass: ${Pass}
Bank Name: ${BA}
Info: ${Info}
===============================`;
    const preBuyAccountInfo = `
🔥 Вы хотите приобрести аккаунт 🔥
Banking Name: ${BA}
Info: ${prebuyinfo}

Цена покупки: ${Price}`;
    await bot.sendMessage(chatId, preBuyAccountInfo, submitBuyAccountButton);
    bot.once("callback_query", async (answer) => {
      if (answer.from.id == chatId) {
        if (answer.data == "submitBuyAccount") {
          let newBalance = userBalance - Price;
          await updateUserBalance(chatId, newBalance, "set");
          await updateLastPurchase(chatId, Login, Pass, Info, BA, Price);
          await deletePurchasedAccount(chatId, Login, Pass, Info, BA, Price);
          await bot.sendMessage(chatId, selectedAccountMessage);
        }
      }
    });
  } catch (error) {
    console.log(`Error submit buy account: ${error}`);
  }
}

async function preBuy(chatId, loginAccount, bankingName) {
  try {
    let userBalance = await checkUserBalance(chatId);
    const findSelectedAccount = await Catalog.findOne(
      {
        bankName: bankingName,
      },
      {
        account: {
          $elemMatch: {
            Login: loginAccount,
          },
        },
      }
    );
    const selectedAccount = findSelectedAccount.account[0];
    const withoutBalanceMessage = `
❌ Недостаточно средств для покупки
${selectedAccount.prebuyinfo}

💸 Ваш баланс: ${userBalance}
⭐️ Пополните баланс и попробуйте еще раз!
`;
    if (userBalance >= selectedAccount.Price) {
      await submitBuy(
        chatId,
        selectedAccount.Login,
        selectedAccount.Pass,
        selectedAccount.Info,
        bankingName,
        selectedAccount.Price,
        userBalance,
        selectedAccount.prebuyinfo
      );
    } else {
      await bot.sendMessage(chatId, withoutBalanceMessage, addBalance);
    }
  } catch (error) {
    console.log(`Error: preBuy selected account: ${error}`);
  }
}

async function deletePurchasedFullInfo(info, state, price, id) {
  try {
    const findSelectedState = await FullInfoModel.findOneAndUpdate(
      {
        State: state,
      },
      {
        $pull: {
          data: {
            Info: info,
            Price: price,
            state: state,
          },
        },
      }
    );
  } catch (error) {
    console.log(`Error delete full info from database: ${error}`);
  }
}

async function submitBuyFullInfoBuy(
  chatId,
  info,
  state,
  price,
  userBalance,
  id
) {
  try {
    const selectedFullInfoMessage = `
Ваш Товар
==============================
Full Info: ${info}
==============================
`;
    const preBuyFullInfoMessage = `Вы хотите приобрести фулку ?
Штат: ${state}
Цена Покупки: ${price}`;
    await bot.sendMessage(
      chatId,
      preBuyFullInfoMessage,
      submitBuyFullInfoButton
    );
    bot.once("callback_query", async (answer) => {
      if (answer.from.id == chatId) {
        if (answer.data == "submitBuyFullInfo") {
          let newBalance = userBalance - price;
          await updateUserBalance(chatId, newBalance, "set");
          await deletePurchasedFullInfo(info, state, price, id);
          await bot.sendMessage(chatId, selectedFullInfoMessage);
        }
      }
    });
  } catch (error) {
    console.log(`Error submit buy fullinfo: ${error}`);
  }
}

async function preBuyFullInfo(chatId, state) {
  try {
    let userBalance = await checkUserBalance(chatId);
    const findSelectedState = await FullInfoModel.findOne({
      State: state,
    });

    const selectedFullInfo = findSelectedState.data[0];
    const withoutBalanceMessage = `
❌ Недостаточно средств для покупки
💸 Ваш баланс: ${userBalance}
⭐️ Пополните баланс и попробуйте еще раз!
`;

    if (userBalance >= selectedFullInfo.Price) {
      await submitBuyFullInfoBuy(
        chatId,
        selectedFullInfo.Info,
        state,
        selectedFullInfo.Price,
        userBalance,
        selectedFullInfo._id
      );
    } else {
      await bot.sendMessage(chatId, withoutBalanceMessage, addBalance);
    }

    console.log(`${state} | ${selectedFullInfo.Info}`);
  } catch (error) {
    console.log(`Error: prebuy selected state: ${error}`);
  }
}

async function addAccountInCategory(
  bankName,
  login,
  pass,
  price,
  info,
  country,
  preBuyInfo
) {
  try {
    const selectBank = await Catalog.findOneAndUpdate(
      {
        bankName: bankName,
        country: country,
      },
      {
        $push: {
          account: {
            Login: login,
            Pass: pass,
            Price: price,
            Info: info,
            prebuyinfo: preBuyInfo,
            BA: bankName,
          },
        },
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.log(`Error Adding Account In Category: ${error}`);
  }
}


async function createCategory(bankingname, country) {
  try {
    await Catalog.create({
      bankName: bankingname,
      country: country,
    });
  } catch (error) {
    console.log(`Error Create Category: ${error}`);
  }
}



async function submitUserTransactionBTC(chatId, amount) {
  try {
    let transactionLink;
    await bot.sendMessage(chatId, "Введите ссылку на транзакцию");
    bot.onText(/.*/, async (ctx) => {
      transactionLink = ctx.text;
      let userID = ctx.from.id;
      let userName = ctx.from.username;
      await sendMessageTransaction(
        transactionLink,
        userName,
        userID,
        amount,
        "BTC"
      );
      await bot.sendMessage(chatId, "Ваша транзакция принята в обработку! Пожалуйста подождите.")
      bot.clearTextListeners();
    });
  } catch (error) {
    console.log(`Error submiting balance: ${error}`);
  }
}

async function submitUserTransactionUSDT(chatId, amount) {
  try {
    let transactionLink;
    await bot.sendMessage(chatId, "Введите ссылку на транзакцию");
    bot.onText(/.*/, async (ctx) => {
      transactionLink = ctx.text;
      let userID = ctx.from.id;
      let userName = ctx.from.username;
      await sendMessageTransaction(
        transactionLink,
        userName,
        userID,
        amount,
        "USDT"
      );
      await bot.sendMessage(chatId, "Ваша транзакция принята в обработку! Пожалуйста подождите.")
      bot.clearTextListeners();
    });
  } catch (error) {
    console.log(`Error submiting balance: ${error}`);
  }
}

async function selectBTCPayment(chatId) {
  try {
    let amount = 0;
    const paymentMessage = `
Вы выбрали способ платежа BTC введите сумму для пополнения,
Введите сумма платежа:    
`;
    await bot.sendMessage(chatId, paymentMessage);
    bot.onText(/^\d*(\.\d+)?$/, async (ctx) => {
      if (ctx.from.id == chatId) {
        amount = ctx.text;
        if (amount > 0) {
          const amountMessage = `
Вы ввели сумму пополнения: ${amount}
Переведите данную сумму на кошелек: 

HERE BTC wallet


если кошелек не подходит для отправки отпишите в саппорту за новым 
Telegram Саппорта: 

После потверждения транзакции саппортом, данная сумма будет пополнена на ваш профиль.
`;
          await bot.sendMessage(chatId, amountMessage, {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Я пополнил",
                    callback_data: `submitUserTransactionBTC|${amount}`,
                  },
                  {
                    text: "Отменить пополнения",
                    callback_data: "main_Menu",
                  },
                ],
              ],
            }),
          });

          bot.clearTextListeners();
        }
      }
    });
  } catch (error) {
    console.log(`Error BTC payment: ${error}`);
  }
}

async function selectUSDTPayment(chatId) {
  try {
    let amount = 0;
    const paymentMessage = `
Вы выбрали способ платежа USDT TRC20 введите сумму для пополнения,
Введите сумма платежа:
`;
    await bot.sendMessage(chatId, paymentMessage);
    bot.onText(/^\d*(\.\d+)?$/, async (ctx) => {
      if (ctx.from.id == chatId) {
        amount = ctx.text;
        if (amount > 0) {
          const amountMessage = `
Вы ввели сумму пополнения: ${amount}
Переведите данную сумму на кошелек: 

HERE USDT Wallet


если кошелек не подходит для отправки отпишите в саппорту за новым 
Telegram Саппорта: 

После потверждения транзакции саппортом, данная сумма будет пополнена на ваш профиль.
`;
          await bot.sendMessage(chatId, amountMessage, {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Я пополнил",
                    callback_data: `submitUserTransactionUSDT|${amount}`,
                  },
                  {
                    text: "Отменить пополнения",
                    callback_data: "main_Menu",
                  },
                ],
              ],
            }),
          });
          bot.clearTextListeners();     
        }
      }
    });
  } catch (error) {
    console.log(`Error USDT payment: ${error}`);
  }
}

async function sendMessageTransaction(
  transaction,
  username,
  userId,
  amount,
  method
) {
  try {
    const transactionMessage = `Человек совершил транзакцию
Ссылка на транзакцию: ${transaction}
Userid: ${userId}
Username: ${username}
Сумма: ${amount}
Метод Оплаты: ${method}`;
    await bot.sendMessage("5472896710", transactionMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "Пополнить баланс",
              callback_data: `submitSupportTransaction|${userId}|${amount}`,
            },
            {
              text: "Проблема с транзакцией",
              callback_data: `problemWithTransaction|${userId}`,
            },
          ],
        ],
      }),
    });
    bot.clearTextListeners();
  } catch (error) {
    console.log(`Error sending transaction message: ${error}`);
  }
}

async function getFullInfoState() {
  try {
    let allCatalogState = [];
    const arrayState = await FullInfoModel.find(
      {},
      {
        State: 1,
      }
    );
    arrayState.forEach(function (obj) {
      allCatalogState.push(obj.State);
    });
    return allCatalogState;
  } catch (error) {
    console.log(`Error retrieved fullinfo catalog: ${error}`);
  }
}

async function sendFullInfoCatalog(chatId) {
  try {
    const fullInfoCatalog = `
🔥 Доступный ассортимент Фулок 🔥
`;
    let allFullInfoCatalogName = await getFullInfoState();
    await bot.sendMessage(chatId, fullInfoCatalog, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          ...allFullInfoCatalogName.map((p) => [
            {
              text: p,
              callback_data: `FullInfo Item: ${p}`,
            },
          ]),
          [
            {
              text: "Вернуться обратно в меню",
              callback_data: "main_Menu",
            },
          ],
        ],
      }),
    });
  } catch (error) {
    console.log(`Error send fullinfo catalog: ${error}`);
  }
}

async function addFullInfoInCategory(fullInfo, state) {
  try {
    const selectFullInfo = await FullInfoModel.findOneAndUpdate(
      {
        State: state,
      },
      {
        $push: {
          data: {
            Info: fullInfo,
            Price: "1.5",
            state: state,
          },
        },
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.log(`Error add fullinfo in database: ${error}`);
  }
}


async function selfRegistr(chatId) {
  try {
    const selfRegistrMessage = `
Ознакомиться с ассортиментом можно в канале -
`;
    await bot.sendMessage(chatId, selfRegistrMessage, rulesMenu);
  } catch (error) {
    console.log(`Error sending self-Registr: ${error}`);
  }
}

async function getCatalogName() {
  try {
    let allCatalogName = [];
    const docs = await Catalog.find(
      {},
      {
        bankName: 1,
      }
    );
    docs.forEach(function (obj) {
      allCatalogName.push(obj.bankName);
    });
    return allCatalogName;
  } catch (error) {
    console.log(`Error Retrieved Category Name: ${error}`);
  }
}

async function getCatalogNameUSA() {
  try {
    let allCatalogName = [];
    const docs = await Catalog.find(
      {
        country: "USA",
      },
      {
        bankName: 1,
      }
    );
    docs.forEach(function (obj) {
      allCatalogName.push(obj.bankName);
    });
    return allCatalogName;
  } catch (error) {
    console.log(`Error Retrieved Category Name: ${error}`);
  }
}

async function getCatalogNameAU() {
  try {
    let allCatalogName = [];
    const docs = await Catalog.find(
      {
        country: "AU",
      },
      {
        bankName: 1,
      }
    );
    docs.forEach(function (obj) {
      allCatalogName.push(obj.bankName);
    });
    return allCatalogName;
  } catch (error) {
    console.log(`Error Retrieved Category Name: ${error}`);
  }
}

async function getAccountList() {
  try {
    const user = await Catalog.find();
    return user;
  } catch (error) {
    console.log(`Error Retrieved Category: ${error}`);
  }
}

async function checkExistUser(chatId, username) {
  try {
    const user = await UserModel.findOne({
      chatId,
    });
    if (!user) {
      let balance = 0;
      let countPurchased = 0;
      await UserModel.create({
        chatId,
        username,
        balance,
        countPurchased,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

const start = async () => {
  try {
    await mongoose.connect(
      "mongodb://localhost:27017/admin?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

     app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));


   

  } catch (error) {
    console.log(`MongoDB Error: ${error.message}`);
  }
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    try {
      if (text === "/start") {
        checkExistUser(chatId, msg.from.username);
        return bot.sendMessage(chatId, startupMessage, menuOption);
      }
    } catch (e) {
      console.log(e);
    }
  });
};

async function sendHelpMessage(chatId) {
  try {
    const helpMessage = `
🔥 Поддержка бота, обращаться по любым вопросам. 🔥
1. 
`;
    await bot.sendMessage(chatId, helpMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Вернуться В Меню",
              callback_data: `main_Menu`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.log(`Send help message: ${error}`);
  }
}

async function sendProfileMessage(chatId) {
  try {
    const user = await UserModel.findOne({
      chatId,
    });
    const userLastPurchase = await checkLastestPurchase(chatId);
    let outMessage = `
================================

👨‍💻 Telegram ID: ${user.chatId}
🛒 Количество покупок: ${await userCountPurchased(chatId)}
💰 Последняя Покупка: ${userLastPurchase}
💵 Баланс: ${user.balance.toFixed(2)}$

================================
`;
    await bot.sendMessage(chatId, outMessage, profileOption);
  } catch (error) {
    console.log(`Send Profile Message: ${error}`);
  }
}

async function userCountPurchased(chatId) {
  try {
    const user = await UserModel.findOne(
      {
        chatId,
      },
      {
        lastPurchased: 1,
      }
    );
    return user.lastPurchased.length;
  } catch (error) {
    console.log(`error`);
  }
}

async function sendMenuMessage(chatId) {
  try {
    await bot.sendMessage(chatId, startupMessage, menuOption);
  } catch (error) {
    console.log(`Error Sending Menu Message: ${error}`);
  }
}

async function checkLastestPurchase(chatId) {
  try {
    let putUserLastPurchase = "Покупок Нет!";
    const user = await UserModel.findOne(
      {
        chatId,
      },
      {
        lastPurchased: 1,
      }
    );
    if (user.lastPurchased.length > 0) {
      const getUserLastPurchase =
        user.lastPurchased[user.lastPurchased.length - 1];
      putUserLastPurchase = `${getUserLastPurchase.bankName}|${getUserLastPurchase.price}|${getUserLastPurchase.date}`;
    }
    return putUserLastPurchase;
  } catch (error) {
    console.log(`Check Lastest Purchase: ${error}`);
  }
}

async function getAllUser() {
  try {
    const users = await UserModel.find();
    return users;
  } catch (error) {
    console.log(`Error when send users: ${error}`);
  }
}

async function updateLastPurchase(chatId, login, pass, info, bankName, price) {
  try {
    const currentDate = moment().format("L");
    let updateObject = {
      Login: `${login}`,
      Pass: `${pass}`,
      Info: `${info}`,
      bankName: `${bankName}`,
      price: `${price}`,
      date: `${currentDate}`,
    };
    const user = await UserModel.findOneAndUpdate(
      {
        chatId,
      },
      {
        $push: {
          lastPurchased: updateObject,
        },
      }
    );
  } catch (error) {
    console.log(`Update Last Purchase: ${error}`);
  }
}



async function updateUserBalance(chatId, newBalance, buying) {
  try {
    if (buying == 'plus') {
      const user = await UserModel.findOneAndUpdate(
        {
          chatId,
        },
        {
          $inc: {
            balance: newBalance,
          },
        }
      );
    }
    if (buying == 'minus') {
      const user = await UserModel.findOneAndUpdate(
        {
          chatId,
        },
        {
          $inc: {
            balance: -newBalance,
          },
        }
      );
    }

    if (buying.includes("set")) {
      const user = await UserModel.findOneAndUpdate(
        {
          chatId,
        },
        {
          $set: {
            balance: newBalance,
          },
        }
      );
    }
  } catch (error) {
    console.log(`Update User Balance: ${error}`);
  }
}

async function sendCatalogUSAMessage(chatId) {
  try {
    const bankingMessage = `
        🔥 Доступный ассортимент банков 🔥
        `;
    let allCatalogName = await getCatalogNameUSA();
    await bot.sendMessage(chatId, bankingMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          ...allCatalogName.map((p) => [
            {
              text: p,
              callback_data: `Banking Item: ${p}`,
            },
          ]),
          [
            {
              text: "Вернуться обратно в меню",
              callback_data: "main_Menu",
            },
          ],
        ],
      }),
    });
  } catch (error) {
    console.log(`Error retrieved catalog Name: ${error}`);
  }
}

async function sendCatalogAUMessage(chatId) {
  try {
    const bankingMessage = `
        🔥 Доступный ассортимент банков 🔥
        `;
    let allCatalogName = await getCatalogNameAU();
    await bot.sendMessage(chatId, bankingMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          ...allCatalogName.map((p) => [
            {
              text: p,
              callback_data: `Banking Item: ${p}`,
            },
          ]),
          [
            {
              text: "Вернуться обратно в меню",
              callback_data: "main_Menu",
            },
          ],
        ],
      }),
    });
  } catch (error) {
    console.log(`Error sending catalog AU: ${error}`);
  }
}

async function addBalanceMessage(chatId) {
  try {
    const bankingMessage = `Выберите способ пополнения:`;
    await bot.sendMessage(chatId, bankingMessage, balanceManager);
  } catch (error) {
    console.log(`Error add Balance Message: ${error}`);
  }
}

async function sendBankItems(chatId, bankingName) {
  try {
    let bankingItemArray = {};
    const bankingItemMessage = `
        🔥 Доступный ассортимент товаров 🔥`;
    const bankingItem = await Catalog.findOne({
      bankName: bankingName,
    });
    bankingItemArray = bankingItem.account.slice(0, 60);
    await bot.sendMessage(chatId, bankingItemMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          ...bankingItemArray.map((p) => [
            {
              text: `${p.Price}$ - ${p.prebuyinfo}`,
              callback_data: `Account: ${p.Login}-${p.BA}`,
            },
          ]),
          [
            {
              text: "Вернуться обратно",
              callback_data: "main_products",
            },
          ],
        ],
      }),
    });
  } catch (error) {
    console.log(`Error sending banking items: ${error}`);
  }
}

async function sendAllProducts(chatId) {
  try {
    const message = `
🔥 С товаром в наличии можете познакомится ниже 🔥
`;
    await bot.sendMessage(chatId, message, addtionalMenu);
  } catch (error) {
    console.log(`Error sending all products: ${error}`);
  }
}

async function sendHistoryMessage(chatId) {
  try {
    let historyMessage;
    const user = await UserModel.findOne(
      {
        chatId,
      },
      {
        lastPurchased: 1,
      }
    );
    if (user.lastPurchased.length > 0) {
      for (let index = 0; index < user.lastPurchased.length; index++) {
        historyMessage += `           
==============================
Login: ${user.lastPurchased[index].Login}
Pass: ${user.lastPurchased[index].Pass}
Info: ${user.lastPurchased[index].Info}
Price: ${user.lastPurchased[index].price}
Banking: ${user.lastPurchased[index].bankName}
Date: ${user.lastPurchased[index].date}
==============================
`;
      }
    }
    await bot.sendMessage(
      chatId,
      historyMessage.replace("undefined", ""),
      profileOption
    );
  } catch (error) {
    console.log(`Error sending history message: ${error}`);
  }
}

async function rulesOption(chatId) {
  try {
    const rulesMessage = `
‼️Список правил использования бота‼️


1. Используя данного бота вы соглашаетесь со всеми правилами, которые написаны в данном разделе.

2. Мы предоставляем гарантию лишь на валидность аккаунта, актуальность баланса и правильность информации.

3. Maxlink PP, аккаунт умер через 4 дня, аккаунт не подошёл, аккаунт заблокировался спустя время - не являются гарантийными случаями, возврата денег или замены за такое не будет.

4. После покупки аккаунта у вас есть 30 минут, чтобы его проверить, после истечения времени - аккаунт не подлежит замене или возврату денег.

5. Замена осуществляется возвратом средств на баланс бота.

6. Любые попытки мошенничества, абуз бота и прочие действия, которые могут как-то навредить работе бота или администрации будут караться блокировкой аккаунта в боте без возврата баланса аккаунта.

7. Администрация проекта не несёт ответственности за вашу способность найти сервис или услугу пробива миников. Возврат средств или замена аккаунта по причине не способности пробить миники не является гарантийным случаем!

8. Денежные средства с бота не могут быть выведены вам на кошелёк.

9. В случае заблокированного аккаунта возврат средств осуществляется только при наличии видео с момента покупки и до момента попытки авторизоваться/прилинковать где четко видно, что аккаунт заблокирован, при отсутствии видео деньги возвращены не будут

10.Администрация бота не несёт ответственности за приход комбо миников, покупка банка с комбо миниками не является гарантийным случаем и не подлежит возврату средств.

11. Возврат средств осуществляется если баланс аккаунта меньше заявленного при покупке более чем на 30%.

⭐️ Приятного использования! ⭐️
`;
    await bot.sendMessage(chatId, rulesMessage, rulesMenu);
  } catch (error) {
    console.log(`Error sending rules menu: ${error}`);
  }
}

bot.on("callback_query", async (msg) => {
  try {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === "main_profile") {
      await sendProfileMessage(chatId);
    }
    if (data === "main_help") {
      await sendHelpMessage(chatId);
    }
    if (data === "main_Menu") {
      await sendMenuMessage(chatId);
    }
    if (data === "main_products") {
      await sendAllProducts(chatId);
    }
    if (data === "USACatalog") {
      await sendCatalogUSAMessage(chatId);
    }
    if (data === "AUCatalog") {
      await sendCatalogAUMessage(chatId);
    }
    if (data.includes("Banking Item")) {
      let bankingName = data.split(":")[1].trim();
      await sendBankItems(chatId, bankingName);
    }
    if (data.includes("Account")) {
      let selectedAccount = data.split(":")[1].split("-")[0].trim();
      let selectedBank = data.split("-")[1].trim();
      console.log(`Search Account: ${selectedAccount} | ${selectedBank}`);
      await preBuy(chatId, selectedAccount, selectedBank);
    }
    if (data.includes("FullInfo Item")) {
      let selectedState = data.split(":")[1].trim();
      await preBuyFullInfo(chatId, selectedState);
    }
    if (data === "main_addBalance") {
      await addBalanceMessage(chatId);
    }
    if (data === "main_purchaseHistory") {
      await sendHistoryMessage(chatId);
    }

    if (data.includes("submitUserTransactionBTC")) {
      let amountPayment = data.split("|")[1];
      await submitUserTransactionBTC(chatId, amountPayment);
    }

    if (data.includes("submitUserTransactionUSDT")) {
      let amountPayment = data.split("|")[1];
      await submitUserTransactionUSDT(chatId, amountPayment);
    }

    if (data === "FullInfo") {
      await sendFullInfoCatalog(chatId);
    }

    if (data === "Channel") {
      await bot.sendMessage(chatId, "channel");
    }

    if (data === "Chat") {
      await bot.sendMessage(chatId);
    }

    if (data === "Registr") {
      await selfRegistr(chatId);
    }
    if (data === "rules") {
      rulesOption(chatId);
    }
    if (data === "addBalance_BTC") {
      selectBTCPayment(chatId);
    }
    if (data === "addBalance_USDTRC20") {
      selectUSDTPayment(chatId);
    }
    if (data.includes("problemWithTransaction")) {
      let userId = data.split("|")[1];
      await bot.sendMessage(
        userId,
        "Проблема с транзакцией свяжитесь с саппортом: "
      );
    }
    if (data.includes("submitSupportTransaction")) {
      let userId = data.split("|")[1];
      let amount = data.split("|")[2];
      await updateUserBalance(userId, amount, 'plus');
      await bot.sendMessage(
        userId,
        `Ваш баланс успешно обновлен! спасибо за пополнение!`
      );
      await bot.sendMessage(
        "support telegram here",
        `Баланс пользователя ${userId}  обновлен!`
      );
    }
  } catch (e) {
    console.log(e);
  }
});

start();
bot.on("polling_error", (error) => console.log(error));
