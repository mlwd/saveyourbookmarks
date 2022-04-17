import 'bootstrap/dist/css/bootstrap.min.css';

const deleteUserButton = document.getElementById("deleteUserButton");
const deleteUserDialog = document.getElementById("deleteUserDialog");

deleteUserButton.addEventListener(
  "click",
  () => {deleteUserDialog.showModal();}
);

deleteUserDialog.addEventListener(
  "close",
  () => {
    const action = deleteUserDialog.returnValue;
    if (action == "confirm") {
      console.log("User deletion confirmed.");
      window.location = "/deleteuser";
    } else {
      console.log("User deletion cancelled.");
    }
  }
);
