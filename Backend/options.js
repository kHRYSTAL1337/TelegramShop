module.exports = {
    menuOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: "🏪 Магазин",
                    callback_data: `main_products`
                }],
                [{

                    text: "💎 Мой профиль",
                    callback_data: `main_profile`
                }],
                [{

                    text: "🆘 Помощь",
                    callback_data: `main_help`
                }],
                [{

                    text: "📘 Правила",
                    callback_data: `rules`
                }],
                [{
                    parse_mode: 'HTML',
                    text: "👇 Канал",
                    url: 'CHANNEL',
                }],
                [{
                    parse_mode: 'HTML',
                    text: "👇 Чат",
                    url: 'CHAT',
                }],
            ]
        })
    },
    profileOption: {
        reply_markup: JSON.stringify({

            inline_keyboard: [
                [{
                        text: "⏬ Баланс",
                        callback_data: `main_addBalance`
                    },
                    {
                        text: "📖 История",
                        callback_data: `main_purchaseHistory`
                    },
                    {
                        text: 'Меню',
                        callback_data: 'main_Menu'
                    }
                ],
            ]
        })
    },
    backToMenu: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'Вернуться обратно в меню',
                    callback_data: 'main_Menu'
                }],
            ]
        })
    },
    addBalance: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                        text: 'Пополнить баланс',
                        callback_data: `main_addBalance`
                    },
                    {
                        text: 'Вернуться обратно в меню',
                        callback_data: 'main_Menu'
                    }
                ],
            ]
        })
    },
    balanceManager: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                        text: 'Пополнить BTC',
                        callback_data: `addBalance_BTC`
                    },
                    {
                        text: 'Пополнить USDT TRC20',
                        callback_data: 'addBalance_USDTRC20'
                    },
                ],
            ]
        })
    },
   
    submitTransactionSupport: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                        text: 'Пополнить баланс юзеру',
                        callback_data: `submitSupportTransaction`
                    },
                    {
                        text: 'Проблема с транзакцией',
                        callback_data: 'problemWithTransaction'
                    },
                ],
            ]
        })
    },
    rulesMenu: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'Меню',
                    callback_data: `main_Menu`
                }, ],
            ]
        })
    },
    submitBuyAccountButton: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'Потвердить покупку',
                    callback_data: `submitBuyAccount`
                }, ],
                [{
                    text: 'Вернуться в меню',
                    callback_data: `main_Menu`
                }, ],
            ]
        })
    },
    submitBuyFullInfoButton: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'Потвердить покупку',
                    callback_data: `submitBuyFullInfo`
                }, ],
                [{
                    text: 'Вернуться в меню',
                    callback_data: `main_Menu`
                }, ],
            ]
        })
    },
    addtionalMenu: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'USA Banking',
                    callback_data: `USACatalog`
                }, ],
                [{
                    text: 'AU Banking',
                    callback_data: `AUCatalog`
                }, ],
                [{
                    text: 'Full Info',
                    callback_data: `FullInfo`
                }, ],
                [{
                    text: 'Самореги',
                    callback_data: `Registr`
                }, ],
                [{
                    text: 'Вернуться в меню',
                    callback_data: `main_Menu`
                }, ],
            ]
        })
    }

}