const { validateSecretKey, readKeyChain, writeKeyChain } = require('./index-keychain');
const { exec, spawn } = require('child_process');
const { app, globalShortcut } = require('electron')
const { BrowserWindow } = require('electron')
const path = require('path')
const { Menu, Tray } = require('electron')
let admin = false;
let connectionList = null;
let mainWindow = null;
let tray = null
let showHide = true;
let productionMode = process.env.production || false;
function ShowHide() {
  if (showHide == true) {
    mainWindow.hide()
    showHide = false;
  }
  else {
    mainWindow.show();
    showHide = true;
  }
}

function createWindow () {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 400,
    height: 660,
    fullscreen: false,
    frame: false,
    autoHideMenuBar: true,
    kiosk: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.setAlwaysOnTop(true, 'screen');
  mainWindow.on('app-command', (e, cmd) => {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
      console.log("backward")
      win.webContents.goBack()
    }
  })
  // and load the index.html of the app.

  mainWindow.on('close', async e => {
    e.preventDefault()
    e.returnValue = true;
  })
  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  // Register a 'CommandOrControl+X' shortcut listener.
 
  const ret = globalShortcut.register('Super+Control+I', function(){
    console.log('Super+Control+I is  pressed')
    console.log('App Closed')
    mainWindow.destroy()
  })
  const ret2 = globalShortcut.register('Super+Control+A', function(){
    console.log('Super+Control+A is  pressed')
    console.log('Show and Hide', showHide)
    ShowHide();
  })

  if (!ret) {
    console.log('registration failed')
  }

  
  if (!ret2) {
    console.log('registration failed')
  }
  createTray();

}

function createTray() {
  tray = new Tray(path.join(__dirname,'./baseline_public_white_24dp.png'))
  tray.setToolTip("Cyber Cafe Session")
  tray.on("click", ()=>{
     ShowHide()
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  // globalShortcut.register('Escape', () => {
  //   app.quit();
  // })
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
    // Register a 'CommandOrControl+X' shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+B', () => {
        console.log('Alt+Tab is pressed')
        })

        if (!ret) {
        console.log('registration failed')
        }

        // Check whether a shortcut is registered.
        console.log(globalShortcut.isRegistered('CommandOrControl+B'))

      
})
function loadApp() {
  mainWindow.loadURL('http://localhost:4200/checkinout')
}
readKeyChain((err, data) => {
  if (err) {
    mainWindow.loadFile('admin-keychain.html');
  }
  else {
    loadApp();
     
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+X')

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})


const {ipcMain} = require('electron');

// Attach listener in the main process with the given ID
ipcMain.on('request-mainprocess-action', (event, arg) => {
    // Displays the object sent from the renderer process:
    //{
    //    message: "Hi",
    //    someData: "Let's go"
    //}
    console.log(
        arg
    );
});
// Attach listener in the main process with the given ID
ipcMain.on('request-agent-hide', (event, arg) => {
    console.log('Agent Hide');
    showHide = true;
    ShowHide();
});
ipcMain.on('request-agent-show', (event, arg) => {
  console.log('Agent Show');
  showHide = false;
  ShowHide();
});

ipcMain.on('request-agent-disconnect', (event, arg) => {
  console.log('Agent Disconnect');
  connectionList.filter(connectName => {

    exec(`netsh interface set interface "${connectName}" disable`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
      
    });
    
  });
  // Agent Connect Disconnect
  console.log('Agent Show');

  showHide = false;
  ShowHide();
});

exec('NET SESSION', function(err,so,se) {
  if (!productionMode) return;
  admin = se.length === 0;
  console.log(se.length === 0 ? "admin" : "not admin");
  if (!admin)
  {
    
    mainWindow.loadFile('admin-require.html');
    setTimeout(() => mainWindow.destroy(), 8000);
  }
});

ipcMain.on('request-agent-connect', (event, arg) => {
  console.log('Agent Connect');
  
connectionList.filter(connectName => {

  exec(`netsh interface set interface "${connectName}" enable`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
    
  });
  
});

  // Agent Connect Internet
  console.log('Agent Closed');
  showHide = true;
  ShowHide();
});



exec('batch-network-status.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  const stdClean = stdout.replace('netsh interface show interface |findstr "Connected"','');

  const ignore = ['Connected','"Connected"', '/\r','/\n','Enabled', 'Dedicated']
  connectionList  = stdClean.replace(/\n/g,'').replace(/\r/g,'').split(" ").filter(item => item != '' && ignore.indexOf(item) == -1).slice(6);
  console.log(stdClean);
  console.log(connectionList)
});



ipcMain.on('request-agent-shutdown', (event, arg) => {
  console.log('Agent Shutdown');
  
  mainWindow.destroy();
});





ipcMain.on('request-agent-clean-session', (event, arg) => {
  console.log('Agent cleaning all the cookies, browser, history');
  

  exec(`batch-clear-cookies-history.bat`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
    
  });
  

});



ipcMain.on('request-agent-log-off', (event, arg) => {
  console.log('Agent cleaning all the cookies, browser, history');
  

  exec(`batch-logoff-timer.bat`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
    
  });
  

});


ipcMain.on('request-agent-keychain-set', (event, arg) => {
  console.log('Setting keychain', arg);
  if (arg) {
    const validKey = validateSecretKey(arg);
    if (validKey) {
      writeKeyChain (arg);
      loadApp();
    }
    
  }
  

});
