// Modules to control application life and create native browser window


console.log("process.resourcesPath")
console.log(process.resourcesPath)

const { app, Menu, dialog, BrowserWindow } = require('electron')
var ipc = require('electron').ipcMain
// const path = require('path') 

var mainWindow = null

// Enable installer events
if (require('electron-squirrel-startup')) app.quit();

// Enable app updates
require('update-electron-app')()


    app.setAboutPanelOptions({
        applicationName: 'PEAT Media Converter',
        applicationVersion: 'v1.0.3 (2023-10-04)'
    });



// App Menu
const template = [{
    role: 'help',
    label: "Help",
    submenu: [
    {
        label: 'App Homepage',
        click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/dylanhthomas/peat-media-converter')
        }
    },
    {
        label: 'PEAT Homepage',
        click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://trace.umd.edu/peat/')
        }
    },
        {
        label: 'About',
        click: async () => {
            app.showAboutPanel()

        }
    },
    ]
}]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


// App Window
function createWindow() {
    // Create the browser window
    const mainWindow = new BrowserWindow({
        resizable: true,
        width: 900,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on("open-file-dialog-for-file", function(event) {
    console.log("button pressed")

    dialog.showOpenDialog(null, {
        properties: ['openFile']
    }).then((result) => {
        console.log(result.filePaths)
        event.sender.send("selected-file", result.filePaths[0])
    }).catch((err) => {
        console.log(err)
    })
})