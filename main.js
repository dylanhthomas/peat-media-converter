// Modules to control application life and create native browser window

const { app, Menu, dialog, BrowserWindow } = require('electron')
var ipc = require('electron').ipcMain
const os = require('os')
var mainWindow = null
const path = require('path')

const isMac = process.platform === 'darwin'


// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();


require('update-electron-app')()




const template = [
  {
    role: 'about',
    label: "About",
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)





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
    mainWindow.webContents.openDevTools()
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on("open-file-dialog-for-file", function(event) {
    console.log("button pressed")

    if (process.platform !== 'darwin') {
        dialog.showOpenDialog(null, {
            properties: ['openFile']
        }).then((result) => {
            console.log(result.filePaths)
            event.sender.send("selected-file", result.filePaths[0])
        }).catch((err) => {
            console.log(err)
        })
    }
})