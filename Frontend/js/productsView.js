const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})




async function loadCategory(nameBank) {
    try {
        let newCategory = `
        <div role="button"  class="category">
                            <a role="button" class="banking" id="${nameBank}" target="_self">${nameBank}</a>
                            <div class="icon-container">
                            <img src="./img/close.png" class="deleteCategory" id="remove${nameBank.trim()}" height="16" width="16" alt="">
                        </div>
                            </div>
                        
        `
        $('#categoryList').append(newCategory);
    } catch (error) {
        console.log(`Error Loading Products View: ${error}`)
    }
}

async function addCategoryView(bankingName, country) {
    try {
        addCategoryApi(bankingName, country)
    } catch (error) {
        console.log(`Error Adding Category View: ${error}`)
    }
}




async function deleteCategory(bankingName) {
    try {
        await deleteCategoryApi(bankingName);
    } catch (error) {
        console.log(`Error Delete Category View: ${error}`)
    }
}

async function addFullInfoView(fullinfo, state) {
    try {
        await addFullInfoApi(fullinfo, state);
    }
    catch (error) {
        console.log(`Error Add FullInfo View: ${error}`);
    }
}

async function editCategory(oldBankingName, newBankingName) {
    try {
        editCategoryApi(oldBankingName, newBankingName);
    } catch (error) {
        console.log(`Error Edit Category View: ${error}`)
    }
}

$('#openCategory').on('click', async function (e) {
    e.preventDefault();
    await snowCategory();
})

async function removeOldRow() {
    await $(".products-row").remove();
}


$(document).on('click', async function (e) {
    let targetDelete = e.target.id;
    if (e.target.id.includes('remove')) {
        let selectedDeleteBank = targetDelete.split('remove')[1];
        Swal.fire({
            title: `Вы хотите удалить каталог ${selectedDeleteBank} ?`,
            confirmButtonText: 'Сохранить',
            denyButtonText: `Отменить`,
            showCancelButton: true,
            confirmButtonColor: '#2869ff',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteCategory(selectedDeleteBank);
            }
        })
    }
    if (e.target.className.includes('deleteAccount')) {
        let selectedDeleteAccount = e.target.id.split('|')[0];
        let selectedDeleteBank = e.target.id.split('|')[1];
        Swal.fire({
            title: `Вы хотите удалить Аккаунт ${selectedDeleteAccount} ?`,
            confirmButtonText: 'Сохранить',
            denyButtonText: `Отменить`,
            showCancelButton: true,
            confirmButtonColor: '#2869ff',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteAccountApi(selectedDeleteAccount, selectedDeleteBank);
            }
        })
    }
});

$(document).on("click", ".banking", async (event) => {
    const clickedBtnID = event.target.id;
    await removeOldRow();
    await getAllAccount();
    let arrayOfAccount = accountList[0];
    if (clickedBtnID == 'seeAllAccounts') {
        for (let index = 0; index < arrayOfAccount.length; index++) {
            const element = arrayOfAccount[index];
            for (let index = 0; index < element.account.length; index++) {
                addAccount(element.bankName, element.account[index].Login, element.account[index].Pass, element.account[index].Price, element.account[index].Info);
            }
        }
    } else {
        for (let index = 0; index < arrayOfAccount.length; index++) {
            const element = arrayOfAccount[index];
            for (let index = 0; index < element.account.length; index++) {
                if (element.bankName === clickedBtnID) {
                    addAccount(element.bankName, element.account[index].Login, element.account[index].Pass, element.account[index].Price, element.account[index].Info);
                }
            }
        }
    }
});


$('#addAccount').on('click', async () => {
    try {
        await $('.modal').css('display', 'block');
    } catch (error) {
        console.log(`Error Opening AddAccount Window: ${error}`);
    }
})

$('#addFullInfo').on('click', async () => {
    try {
        await $('.modal-3').css('display', 'block');
    } catch (error) {
        console.log(`Error Opening AddAccount Window: ${error}`);
    }
})

$('#addCategory').on('click', async () => {
    try {
        await $('.modal-2').css('display', 'block');
    } catch (error) {
        console.log(`Error Opening AddAccount Window: ${error}`);
    }
})

$('#addFullInfoView').on('click', async () => {
    let FullInfo_input = $('#FullInfo_input').val();
    let State_input = $('#State_input').val();
    if (FullInfo_input.length == 0 || State_input.length == 0)
        return snowError('Поля с звездами не должны быть пустыми!');
    await addFullInfoApi(FullInfo_input, State_input);
    $('.modal-2').css('display', 'none');
})

$('#addCategoryView').on('click', async () => {
    let bankName_input = $('#bankingName_input').val().trim();
    let bankCountry_input = $('#bankingCountry_input').val().trim();
    if (bankName_input.length == 0 || bankCountry_input.length == 0)
        return snowError('Поля с звездами не должны быть пустыми!');
    await addCategoryView(bankName_input, bankCountry_input);
    $('.modal-2').css('display', 'none');
});


$('.modal__close').on('click', () => {
    $('.modal').css('display', 'none');
})

$('.modalClose').on('click', () => {
    $('.modal-2').css('display', 'none');
})

$('.modalClose-3').on('click', () => {
    $('.modal-3').css('display', 'none');
})

$('#addAccountButton').on('click', async () => {
    try {
        let bankName = $('#bankName_input').val().trim();
        let Login = $('#login_input').val().trim();
        let Pass = $('#password_input').val().trim();
        let Price = $('#price_input').val().trim();
        let Info = $('#info_input').val();
        let preBuyInfo = $('#preBuyInfo_input').val();
        let country = $('#country_input').val().trim();
        if (bankName.length == 0 || Login.length == 0 || Pass.length == 0 || Price.length == 0 || country.length == 0 || preBuyInfo.length == 0)
            return snowError('Поля с звездами не должны быть пустыми!');
        await addAccountApi(bankName, Login, Pass, Price, Info, country, preBuyInfo);
        $('.modal').css('display', 'none');
    } catch (error) {
        console.log(`Error add account in database View: ${error}`);
    }
});

$('.deleteAccount').on('click', () => {
    console.log('Click');
});



function addAccount(bankName, login, pass, price, info) {
    try {
        let newAccount = `
        <div class="products-row">
          <div class="product-cell image">
            <span>${bankName}</span>
          </div>
        <div class="product-cell login">${login}</div>
        <div class="product-cell pass">${pass}</div>
        <div class="product-cell price">${price}</div>
        <div class="product-cell info">${info}</div>
        <div class="icon-container">
        <img src="./img/close.png" class="deleteAccount" id="${login}|${bankName}" height="16" width="16" alt="">
    </div>
      </div>
     
      `
        $('.products-area-wrapper').append(newAccount);
    } catch (error) {
        console.log(`Error Adding Account View: ${error}`);
    }
}



async function snowCategory() {
    if ($('#categoryList').hasClass('snow-category'))
        $('#categoryList').removeClass('snow-category').addClass('close-category');
    else
        $('#categoryList').addClass('snow-category').removeClass('close-category');
}

async function snowStatus(title) {
    try {
        await Toast.fire({
            icon: 'success',
            title: `${title}`
        })
    } catch (error) {
        console.log(error)
    }
}

async function snowError(text) {
    try {
        await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            confirmButtonColor: '#2869ff',
            text: `${text}`,
        })
    } catch (error) {
        console.log(error)
    }
}