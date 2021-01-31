const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");


function createWindow () {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });

    win.loadFile("src/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});

ipcMain.handle("SaveFile", async (event, filePath, content) => {
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            return err;
        } else {
            return true;
        }
    });
});

ipcMain.handle("SaveAsNewFile", async (event) => {
    let responseObj = await dialog.showSaveDialog();

    let filePathSeparated = responseObj.filePath.split(path.sep);
    let filePathSeparatedCount = filePathSeparated.length;

    return {
        filePath: responseObj.filePath,
        fileName: filePathSeparated[filePathSeparatedCount - 1]
    };
});

ipcMain.handle("AskToSave", async (event) => {
    let options  = {
        type: "question",
        buttons: ["Yes", "No"],
        title: "Would you like to save?",
        message: "The file has been edited since you last saved. Would you like to save the file first?"
    };

    let responseObj = await dialog.showMessageBox(options);

    if (responseObj.response === 0) {
        return true;
    } else {
        return false;
    }
});