const { ipcRenderer } = require("electron");


document.addEventListener("DOMContentLoaded", onLoad);

const globalVars = {
    isSaved: true,
    savingFile: false
}

// Set event handlers
function onLoad(event) {
    // Create new
    let createNewButton = document.querySelector("#create-new");
    createNewButton.addEventListener("click", openCreateNew);

    // Open existing
    let openExistingButton = document.querySelector("#open-existing");
    openExistingButton.addEventListener("click", openExisting);
    let openExistingInput = document.querySelector("#open-existing-input");
    openExistingInput.addEventListener("change", openTextFile);

    // Text edit form buttons
    let saveButton = document.querySelector("#save-button");
    saveButton.addEventListener("click", saveForm);
    let closeButton = document.querySelector("#close-button");
    closeButton.addEventListener("click", closeForm);

    // Text edit form input
    let textContent = document.querySelector("#text-content");
    textContent.addEventListener("input", (event) => globalVars.isSaved ? globalVars.isSaved = false : true);
}

function openCreateNew(event) {
    // Get divs
    let mainMenu = document.querySelector("#main-menu");
    let textEditForm = document.querySelector("#text-edit-form");

    // Show form div
    mainMenu.classList.add("w3-hide");
    textEditForm.classList.remove("w3-hide");

    // Set new file name
    let fileName = document.querySelector("#file-name");
    fileName.innerText = "New file";
}

function openExisting(event) {
    let openExistingInput = document.querySelector("#open-existing-input");

    // Open file picker
    openExistingInput.click();
}

function openTextFile(event) {
    if (event.target.files.length !== 1) {
        return;
    }
    
    // Get file object
    const file = event.target.files[0];

    // Remove files from input
    event.target.value = "";

    // Retrieve file text
    file.text().then((text) => {
        let textArea = document.querySelector("#text-content");
        textArea.value = text;
    });

    // Set file details
    let fileName = document.querySelector("#file-name");
    fileName.innerText = file.name;
    let filePath = document.querySelector("#file-path");
    filePath.value = file.path;

    // Get divs
    let mainMenu = document.querySelector("#main-menu");
    let textEditForm = document.querySelector("#text-edit-form");

    // Show form div
    mainMenu.classList.add("w3-hide");
    textEditForm.classList.remove("w3-hide");
}

async function saveForm(event) {
    if (!globalVars.isSaved && !globalVars.savingFile)  {
        globalVars.savingFile = true;
        let filePath = document.querySelector("#file-path").value;
        let content = document.querySelector("#text-content").value;

        if (filePath === "") {
            // Save as new file
            responseObj = await ipcRenderer.invoke("SaveAsNewFile");
            filePath = responseObj.filePath;
            
            // Set new file name
            let fileName = document.querySelector("#file-name");
            fileName.innerText = responseObj.fileName;
        } 

        let response = await ipcRenderer.invoke("SaveFile", filePath, content);

        globalVars.isSaved = true;
        globalVars.savingFile = false;

        return response;
    } else {
        return false;
    }
}

async function closeForm(event) {
    // Check if saved
    if (!globalVars.isSaved) {
        let doSave = await ipcRenderer.invoke("AskToSave");

        if (doSave) {
            await saveForm(event);
        }
    }

    // Empty text area
    let textArea = document.querySelector("#text-content");
    textArea.value = "";

    // Get divs
    let mainMenu = document.querySelector("#main-menu");
    let textEditForm = document.querySelector("#text-edit-form");

    // Show main menu div
    mainMenu.classList.remove("w3-hide");
    textEditForm.classList.add("w3-hide");
}