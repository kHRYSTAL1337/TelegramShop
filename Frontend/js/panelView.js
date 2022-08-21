let selectedUser;

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

async function addUserView(userid, telegramName, lastPurchase, balance) {
  try {
    let newUser = `
        <tr>
                    <td>
                      <span class="custom-checkbox">
                                          <input type="checkbox" id="${userid}" name="options[]" value="1">
                                          <label for="${userid}"></label>
                                      </span>
                    </td>
                    <td>${userid}</td>
                    <td>${telegramName}</td>
                    <td>${lastPurchase}</td>
                    <td>${balance}$</td>
                    <td>
                      <a  class="edit" data-toggle="modal"><i id="editBalance" class="material-icons" data-toggle="modal" data-target="#exampleModalCenter" title="" data-original-title="Edit"></i></a>
                    </td>
                  </tr>
     `;
    await $("tbody").append(newUser);
  } catch (error) {
    console.log(`Error adding user: ${error.message}`);
  }
}

$("#submitBalance").on("click", async function (e) {
  e.preventDefault();
  try {
    let newBalance = $("#balanceInput").val().trim();
    let editType;

    if (newBalance.includes("+")) {
      editType = "plus";
    }
    if (newBalance.includes("-")) {
      editType = "minus";
    }

    if (editType == undefined) {
      editType = "set";
    }

    newBalance = newBalance.replace("+", "").replace("-", "");

    if (newBalance.length == 0) {
      return snowError(`Поле не может быть пустым!`);
    }
    if (selectedUser == null || selectedUser == undefined)
      return snowError(`Выберите пользователя!`);
    await editBalanceUserView(newBalance, editType);
  } catch (error) {
    console.log(error);
  }
});

async function editBalanceUserView(newBalance, editType) {
  try {
    await editBalanceUserApi(selectedUser, newBalance, editType);
  } catch (error) {
    console.log(`Error update balance user: ${error.message}`);
  }
}

// $('.close').on('click', function (e) {
//     $('#modal').addClass('hidden')
// });

$("#cancelButton").on("click", function (e) {
  e.preventDefault();
  try {
    $("#modal").addClass("hidden");
  } catch (error) {
    console.log(`Error Close Modal: ${error}`);
  }
});

$(document).on("click", (e) => {
  if (e.target.type == "checkbox") {
    if ($(e.target).is(":checked")) {
      selectedUser = e.target.id;
    }
  }
  // if (e.target.class = "material-icons" && e.target.id == "editBalance") {
  //     $('.modal-dialog').removeClass('hidden');
  // }
});

async function snowStatus(title) {
  try {
    await Toast.fire({
      icon: "success",
      title: `${title}`,
    });
  } catch (error) {
    console.log(error);
  }
}

async function snowError(text) {
  try {
    await Swal.fire({
      icon: "error",
      title: "Oops...",
      confirmButtonColor: "#1f1c2e",
      text: `${text}`,
    });
  } catch (error) {
    console.log(error);
  }
}
