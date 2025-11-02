let totalAmount = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const productTitleError = document.getElementById("product-title-error");
const amount = document.getElementById("amount");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const list = document.getElementById("list");
let tempAmount = 0;

// Theme Toggle Functionality
const themeSwitch = document.getElementById("theme-switch");
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem("theme") || "light";
if (currentTheme === "dark") {
    htmlElement.setAttribute("data-theme", "dark");
    themeSwitch.checked = true;
}

themeSwitch.addEventListener("change", function() {
    if (this.checked) {
        htmlElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        htmlElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    }
});

// Set Budget Functions
totalAmountButton.addEventListener("click", () => {
    tempAmount = totalAmount.value;
    
    // Bad input
    if (tempAmount === "" || tempAmount < 0) {
        errorMessage.classList.remove("hide");
    } else {
        errorMessage.classList.add("hide");
        // Set budget
        amount.innerHTML = tempAmount;
        balanceValue.innerText = tempAmount - expenditureValue.innerText;
        // Clear input
        totalAmount.value = "";
    }
});

// Disable edit and delete button function
const disableButtons = (bool) => {
    let editButtons = document.getElementsByClassName("edit");
    Array.from(editButtons).forEach((element) => {
        element.disabled = bool;
    });
};

// Modify list elements function
const modifyElement = (element, edit = false) => {
    let parentDiv = element.parentElement;
    let currentBalance = balanceValue.innerText;
    let currentExpense = expenditureValue.innerText;
    let parentAmount = parentDiv.querySelector(".amount").innerText;
    
    if (edit) {
        let parentText = parentDiv.querySelector(".product").innerText;
        productTitle.value = parentText;
        userAmount.value = parentAmount;
        disableButtons(true);
    }
    
    balanceValue.innerText = parseInt(currentBalance) + parseInt(parentAmount);
    expenditureValue.innerText = parseInt(currentExpense) - parseInt(parentAmount);
    parentDiv.remove();
};

// Create list function
const listCreator = (expenseName, expenseValue) => {
    let subListContent = document.createElement("div");
    subListContent.classList.add("sublist-content");
    list.appendChild(subListContent);
    
    subListContent.innerHTML = `
        <div class="product">${expenseName}</div>
        <div class="amount">${expenseValue}</div>
    `;
    
    let editButton = document.createElement("button");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
    editButton.addEventListener("click", () => {
        modifyElement(editButton, true);
    });
    
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
    deleteButton.addEventListener("click", () => {
        modifyElement(deleteButton);
    });
    
    subListContent.appendChild(editButton);
    subListContent.appendChild(deleteButton);
    document.getElementById("list").appendChild(subListContent);
};

// Add expenses function
checkAmountButton.addEventListener("click", () => {
    // Check empty
    if (!userAmount.value || !productTitle.value) {
        productTitleError.classList.remove("hide");
        return false;
    }
    
    // Hide error
    productTitleError.classList.add("hide");
    
    // Enable buttons
    disableButtons(false);
    
    // Expense
    let expenditure = parseInt(userAmount.value);
    
    // Total expense (existing + new)
    let sum = parseInt(expenditureValue.innerText) + expenditure;
    expenditureValue.innerText = sum;
    
    // Total balance = budget - total expense
    const totalBalance = tempAmount - sum;
    balanceValue.innerText = totalBalance;
    
    // Create list
    listCreator(productTitle.value, userAmount.value);
    
    // Clear inputs
    productTitle.value = "";
    userAmount.value = "";
});
