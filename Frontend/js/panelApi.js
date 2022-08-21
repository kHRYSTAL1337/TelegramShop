// telegram-server.xyz
// http://localhost:5000/

async function addUserApi() {
    try {
       await axios.get('https://localhost:5000/getAllUser')
            .then(function (response) {
                response.data.forEach(function (data, index) {
                    let lastPurchase;
                    let chatId = data.chatId;
                    let username = data.username;
                    let balance = data.balance;
                    if (data.lastPurchased[0]) {
                        lastPurchase = data.lastPurchased[data.lastPurchased.length -1];
                        lastPurchase = `${lastPurchase.bankName}|${lastPurchase.price}|${lastPurchase.date}`;
                    } else lastPurchase = "None";   
                    if (!username) username = "None";
                     addUserView(chatId, username, lastPurchase, balance);
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error adding user Api: ${error.message}`);
    }
}

addUserApi();

async function editBalanceUserApi(userid, newBalance, editType) {
    try {
        let payload = `userId=${userid}&newBalance=${newBalance}&typeEdit=${editType}`;
        await axios.post('https://localhost:5000/addBalance', payload)
            .then(function (response) {
                if(response.data == "Balance Updated"){
                    snowStatus(`Баланс успешно обновлен! Пользователь: ${userid}`);
                }
                else snowError(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error adding user Api: ${error.message}`);
    }
}