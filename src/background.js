'use strict'

import { app, protocol, BrowserWindow, ipcMain,dialog, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

const fs = require('fs');
const url = require("url")
const JSZip = require('jszip');
const path = require("path");
const { join } = require('path');



var autosettings = {
  savePath: "Default",
  studentNumber: "Default"
}

var filesToWatch = [];

require("@electron/remote/main").initialize();


const pathToSettings = './autosettings.json'

function startupReadJSON(win){
  

try {
  if (fs.existsSync(pathToSettings)) {
    //file exists // Read users.json file
    console.log("File exist")
      fs.readFile("./autosettings.json", function(err, data) {        
        // Check for errors
        if (err) throw err;     
        // Converting to JSON
        const settings = JSON.parse(data);   
        autosettings = settings;
        console.log(settings); 
        win.send("on-settings-read", [autosettings.studentNumber, autosettings.savePath]);
        console.log('sent: ' + autosettings.studentNumber);
    });
  }
  else{
    fs.writeFile("./autosettings.json", '{"settings":{"studentNumber":"DEFLT001","outputPath":"C"}}', err => {
     
      // Checking for errors
      if (err) throw err; 
     
      console.log("Done writing"); // Success
  });
  }
} catch(err) {
  console.error(err)
}

}
function writeJSON(){
  fs.writeFile("./autosettings.json", JSON.stringify(autosettings), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});
}


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


function addFilesToWatch(filesToAppend){
  
  let tempFileArray = filesToWatch.concat(filesToAppend)

  let uniqueArray = tempFileArray.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
  })

  filesToWatch = uniqueArray

  console.log('FILE ARRAY: ' + filesToWatch)
}

function removeFilesToWatch(fileToRemove, win){
  //console.log("ABOUT TO REMOVE FILE: " + fileToRemove)
  filesToWatch = filesToWatch.filter(function(item, pos, self){
      if(item != fileToRemove){
        return item;
      }
  })
  console.log("FILES AFTER REMOVE: " + filesToWatch)
  win.webContents.send("on-files-updated", filesToWatch)

}

function zip(filesToZip, win){
  if(autosettings.savePath == "Default") {return;}
  console.log("Files being zipped: " + filesToZip)
  const zip = new JSZip();
  try {
      filesToZip.forEach(element => {
          let filename = element.substring(element.lastIndexOf("\\") + 1,element.length);
          console.log(filename);
          zip.file(filename, fs.readFileSync(element));
      });
  
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
          .pipe(fs.createWriteStream(autosettings.savePath +'\\'+ autosettings.studentNumber +'.zip'))
          .on('finish', function () {
              console.log("Written to: " + autosettings.savePath +'\\'+ autosettings.studentNumber +'.zip')
              console.log(autosettings.studentNumber+".zip written.");
              win.webContents.send("zip-created");
          });
  
  } catch (err) {
      console.error(err)
  }

}

function getFilesToZip(win){
  
  dialog.showOpenDialog({
      defaultPath: app.getPath("desktop"),
      buttonLabel: "Select files to watch",
      properties: ["multiSelections", "openFile"]

  }).then((result)=>
  {
      
      //filesToWatch = result.filePaths;
      addFilesToWatch(result.filePaths)
      const fs = require('fs');
      filesToWatch.forEach(element => {
          fs.watch(element, (eventType) => {
              let filename = element.slice(element.lastIndexOf('\\') + 1, element.length-1)

              console.log("\nThe file", filename, "was modified!");
              console.log("The type of change was:", eventType);
              zip(filesToWatch, win)
            });  
      });
      win.webContents.send("on-files-updated", filesToWatch)
      
  }).catch((e)=>{
    console.log(e)
  });
}

function getFileDir(win){
  dialog.showOpenDialog({
    defaultPath: app.getPath("desktop"),
    buttonLabel: "Select Output Directory",
    properties: ["openDirectory"]

    }).then((result)=>{
      win.webContents.send("on-output-dir", result.filePaths)
      autosettings.savePath = result.filePaths[0];
      writeJSON();
    }).catch((e)=>{
      console.log('Something fucked up')
    });
}

function onStudentNumberUpdated(studentNumber){
  autosettings.studentNumber = studentNumber;
  console.log("STUDENT NO: " + autosettings.studentNumber)
  writeJSON();
}

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }   
  })

//    menu = Menu.buildFromTemplate([
//     {
//         label: ''
//     }
// ]);
  
  //Menu.setApplicationMenu(menu)

  ipcMain.on("open-file-search", (event, args)=>{getFilesToZip(win);})
  ipcMain.on("open-file-explore", (event, arg)=>{getFileDir(win)})
  ipcMain.on("student-number-updated", (event, args)=>{onStudentNumberUpdated(args);})
  ipcMain.on("delete-file-watcher", (event, args)=>{removeFilesToWatch(args, win)})
  ipcMain.on("readSettings", ()=>{
    startupReadJSON(win)
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

}

// Quit when all windows are closed.
app.on('window-all-closed', (event, arg) => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  
  createWindow()
  
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}





