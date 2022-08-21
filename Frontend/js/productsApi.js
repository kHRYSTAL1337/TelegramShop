//telegram-server.xyz
//

let accountList = [];
async function getCatalog() {
    try {
        await axios.get('https://localhost:5000/getCatalog')
            .then(function (response) {
                response.data.forEach(function (data) {
                    loadCategory(data);
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error Download All Category: ${error}`);
    }
}

async function addFullInfoApi(fullinfo, state) {
    try {
        const payload =`fullinfo=${fullinfo}&state=${state}`;
        await axios.post('https://localhost:5000/addFullInfo', payload)
            .then(function (response) {
                if (response.data == "Фулка успешно добавлена!") {
                    snowStatus(`Фулка успешно добавлена!`);
                } else snowError(response.data);
            })
    } catch (error) {
        console.log(`Error Add FullInfo API: ${error}`);
    }
}

async function getAllAccount() {
    try {
        await axios.get('https://localhost:5000/getAllAccount')
            .then(function (response) {
                accountList.push(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error retrieved account API: ${error}`);
    }
}



async function addAccountApi(bankingName, login, pass, price, info, country, prebuyinfo) {
    try {
        const payload = `bankingName=${bankingName}&Login=${login}&Pass=${pass}&Price=${price}&Info=${info}&BA=${bankingName}&country=${country}&prebuyinfo=${prebuyinfo}`;
        await axios.post('https://localhost:5000/addAccount', payload)
            .then(function (response) {
                if (response.data == "Аккаунт успешно был добавлен в базу!") {
                    snowStatus(`Аккаунт успешно был добавлен в базу!`);
                    getAllAccount();
                } else snowError(response.data);
            })
    } catch (error) {
        console.log(`Error Loading Account: ${error}`);
    }
}

async function editCategoryApi(oldBankingName, newBankingName) {
    try {
        const payload = `oldBankingName=${oldBankingName}&newBankingName=${newBankingName}`;
        await axios.post('https://localhost:5000/editCategory', payload)
            .then(function (response) {
                if (response.data == "Каталог успешно Изменен!") {
                    snowStatus(`Каталог успешно Изменен! Каталог: ${oldBankingName} на ${newBankingName}`);
                    getCatalog();
                } else snowError(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error Edit Category API: ${error}`);
    }
}

async function addCategoryApi(bankingName, country) {
    try {
        const payload = `bankingName=${bankingName}&country=${country}`;
        await axios.post('https://localhost:5000/createCategory', payload)
            .then(function (response) {
                if (response.data == "Каталог успешно создан!") {
                    snowStatus(`Каталог успешно создан! Каталог: ${bankingName}`);
                } else snowError(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error Adding Category API: ${error}`);
    }
}


async function deleteAccountApi(selectedAccount, selectedBanking) {
    try {
        const payload = `account=${selectedAccount}&bankingName=${selectedBanking}`;
        await axios.post('https://localhost:5000/deleteAccount', payload)
            .then(function (response) {
                if (response.data == "Аккаунт успешно Удален!") {
                    snowStatus(`Аккаунт ${bankingName} успешно Удален!`);
                    getAllAccount();
                } else snowError(response.data);
            })
    } catch (error) {
        console.log(`Error Delete Account API: ${error}`)
    }
}


async function deleteCategoryApi(bankingName) {
    try {
        const payload = `bankingName=${bankingName}`;
        await axios.post('https://localhost:5000/deleteCategory', payload)
            .then(function (response) {
                if (response.data == "Каталог успешно Удален!") {
                    snowStatus(`Каталог успешно Удален! Каталог: ${bankingName}`);
                } else snowError(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(`Error Delete Category API: ${error}`);
    }
}

getCatalog();