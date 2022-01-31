

const  net  =  require('net');
const { validateSecretKey, readKeyChain, writeKeyChain,cleanKeyChain } = require('./index-keychain');
const { exec, spawn } = require('child_process');
const { app, globalShortcut } = require('electron')
const { BrowserWindow } = require('electron')
const path = require('path')
// const http = require('http')
const { Menu, Tray } = require('electron')
let admin = false;
let connectionList = null;
let mainWindow = null;
let tray = null
let showHide = true;
let productionMode = process.env.production || false;
let cafeAgentId = null;
const hostname = 'ec2-3-132-213-115.us-east-2.compute.amazonaws.com';
const sitedomain = "https://cybercafeapp.com";
// const sitedomain = "http://localhost:4200";

const electron = require('electron')
// function electronAppStatus(onlineStatus) {
//  console.log('APP ONLINE STATUS HTTP CALL',onlineStatus)
  
//   var post_data = JSON.stringify({
//       id: cafeAgentId,
//       agentOnline: onlineStatus
//     });

//       // An object of options to indicate where to post to
//       var post_options = {
//           host: hostname,
//           port: '5000',
//           path: '/agent/onlineAgent',
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//               'Content-Length': Buffer.byteLength(post_data)
//           }
//       };

//       // Set up the request
//       var post_req = http.request(post_options, function(res) {
//           res.setEncoding('utf8');
//           res.on('data', function (chunk) {
//               console.log('Response: ' + chunk);
//           });
//       });

//       // post the data
//       post_req.write(post_data);
//       post_req.end();

// }
function ShowHide() {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

  let currentURL = mainWindow.webContents.getURL();
  console.log(currentURL)
  if (currentURL && currentURL.indexOf('/checkinout/') != -1) return;
  if (showHide == true) {
    mainWindow.setSize(90, 40);
    mainWindow.setPosition(Math.round(width *.8 ),0)
    //mainWindow.hide()
    mainWindow.setAlwaysOnTop(true)
    showHide = false;
    
    // Below statement completes the flow
    mainWindow.moveTop();
    

  }
  else {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
   
    mainWindow.setSize(Math.round(width*.9), height);
    //mainWindow.show();
    showHide = true;
    mainWindow.setAlwaysOnTop(true)
    mainWindow.setPosition(Math.round(width *.05 ),0)

  }
}

function createWindow () {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  console.log(width, height)
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width:  Math.round(width*.9),
    height: height,
    fullscreen: false,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    transparent: false,
    kiosk: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.setSkipTaskbar(true);

  mainWindow.setAlwaysOnTop(true, 'screen');
  mainWindow.on('app-command', (e, cmd) => {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      console.log("backward")
      mainWindow.webContents.goBack()
    }
  })
  // and load the index.html of the app.
  
  mainWindow.on('close', async e => {
    e.preventDefault()
    e.returnValue = true;
  })

  mainWindow.on('closed', function(){
      
      mainWindow = null;
      app.quit();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // Register a 'CommandOrControl+X' shortcut listener.
 
  const ret = globalShortcut.register('Super+Control+I', function(){
    console.log('Super+Control+I is  pressed')
    console.log('App Closed')
    mainWindow.destroy()
  })
  const ret2 = globalShortcut.register('Super+Control+A', function(){
    
  })

  if (!ret) {
    console.log('registration failed')
  }

  
  if (!ret2) {
    console.log('registration failed')
  }
  createTray();
  readKeyChain((err, data) => {
  
    if (err) {
      console.log(mainWindow, ' naasir')
      mainWindow.loadFile('admin-keychain.html');
    }
    else {
      cafeAgentId = data;
      if (!cafeAgentId) {
         mainWindow.loadFile('admin-keychain.html');
      }
      else {
        loadApp(data);
      }
       
    }
  })
}

function createTray() {
  // tray = new Tray(path.join(__dirname,'./baseline_public_white_24dp.png'))
  // tray.setToolTip("Cyber Cafe Session")
  // tray.on("click", ()=>{
  //    ShowHide()
  // });
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
function loadApp(arg) {
  mainWindow.loadURL(sitedomain+'/checkinout/'+arg)
}




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
        arg,' arg'
    );
});
// Attach listener in the main process with the given ID
ipcMain.on('request-agent-hide', (event, arg) => {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  let currentURL = mainWindow.webContents.getURL();
  console.log(currentURL)
  if (currentURL && currentURL.indexOf('/checkinout/') != -1) return;
  mainWindow.setSize(90, 40);
  mainWindow.setPosition(Math.round(width *.8 ),0)
  //mainWindow.hide()
  mainWindow.setAlwaysOnTop(true)
  showHide = false;
  
  // Below statement completes the flow
  mainWindow.moveTop();
    

  

  
});
ipcMain.on('request-agent-show', (event, arg) => {
  let currentURL = mainWindow.webContents.getURL();

  if (currentURL && currentURL.indexOf('/checkinout/') != -1) return;
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
   
  mainWindow.setSize(Math.round(width*.9), height);
  mainWindow.setPosition(Math.round(width *.05 ),0)

  //mainWindow.show();
  showHide = true;
  mainWindow.setAlwaysOnTop(true)
  mainWindow.setPosition(Math.round(width *.05 ),0)

});

ipcMain.on('request-agent-disconnect', (event, arg) => {
  console.log('Agent Disconnect');
  // if (connectionList.length) {

  //   connectionList.filter(connectName => {

  //     exec(`netsh interface set interface "${connectName}" disable`, (err, stdout, stderr) => {
  //       if (err) {
  //         console.error(err);
  //         return;
  //       }
  //       console.log(stdout);
        
  //     });
      
  //   });
  // }
    // Agent Connect Disconnect
    console.log('Agent Show');
  

 
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
  // if (connectionList && connectionList.length) {
  //   connectionList.filter(connectName => {

  //     exec(`netsh interface set interface "${connectName}" enable`, (err, stdout, stderr) => {
  //       if (err) {
  //         console.error(err);
  //         return;
  //       }
  //       console.log(stdout);
        
  //     });
      
  //   });
  // }


  // Agent Connect Internet
  // console.log('Agent Closed');
  // showHide = true;
  // ShowHide();
});



// exec('batch-network-status.bat', (err, stdout, stderr) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   const stdClean = stdout.replace('netsh interface show interface |findstr "Connected"','');

//   const ignore = ['Connected','"Connected"', '/\r','/\n','Enabled', 'Dedicated'];

//   connectionList  = stdClean.replace(/\n/g,'');
//   connectionList  = connectionList.replace(/\r/g,'');
//   connectionList = connectionList.split(" ");
//   if (connectionList && connectionList.length) {
//     connectionList = connectionList.filter(item => item != '' && ignore.indexOf(item) == -1);
//     connectionList = connectionList && connectionList.slice(6) || connectionList; 
//   }
  
//   console.log(stdClean);
//   console.log(connectionList)
// });



ipcMain.on('request-agent-shutdown', (event, arg) => {
  console.log('Agent Shutdown');
  
  mainWindow.destroy();
});


function LOCK_DESKTOP() {
 
  console.log('Agent Locking the computer');
  

  exec(`rundll32.exe user32.dll,LockWorkStation`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
    
  });
}

function CLEAR_HISTORY() {
  console.log('Agent cleaning all the cookies, browser, history');
  

  exec(`batch-clear-cookies-history.bat`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
    
  });
}
ipcMain.on('request-agent-clean-session', (event, arg) => {
  CLEAR_HISTORY();
  

});

function ACTION_SHUTDOWN() {
  console.log('PC SHUTDOWN');
    exec(`shutdown now`, (err, stdout, stderr) => {
      if (err) { console.error(err);return;}
      console.log(stdout);
    });
} 

function ACTION_LIMIT(timer = 30) {
  CLEAR_HISTORY()
  console.log('PC LOGOFF LIMIT ', timer);
  exec(`shutdown -l`, (err, stdout, stderr) => {
    if (err) { console.error(err);return;}
    console.log(stdout);
  });
}
ipcMain.on('request-agent-log-off', (event, arg) => {
  ACTION_LIMIT(1);
});


ipcMain.on('request-agent-keychain-set', (event, arg) => {
  console.log('Setting keychain', arg);
  if (arg) {
    const validKey = validateSecretKey(arg);
    if (validKey) {
      writeKeyChain (arg);
      loadApp(arg);
    }
    
  }
  

});



























// Node.js socket client script

// Connect to a server @ port 9898
const client = net.createConnection({ port: 9898, host: 'ec2-3-132-213-115.us-east-2.compute.amazonaws.com' }, () => {
// const client = net.createConnection({ port: 9898 }, () => {
  
  if (client) {
      console.log('CLIENT: I connected to the server.', cafeAgentId);
      client.write('CLIENT: Hello this is client from agent!');
  }
  else {
    console.log('Server not available');
  }
   
});
client.on('data', (data) => {
  console.log(data, 'data')

  if (!data) return;
  
  try {
    data = data.toString();
  }
  catch(e) {
    console.log('error in data', e)
    return;
  }
  console.log(data, 'data')
  if (!data) return;
  let msg = JSON.parse(data);
  const agentid = msg.agentid;
  if (cafeAgentId != agentid) return;
  const action = msg.action;
  const timer = msg.timer;
  switch(action) {
        case 'LOCK':
          ACTION_LIMIT(1)  
          break;
        case 'SETLOGOFF':
           ACTION_LIMIT(timer)  
           break;
      
        case 'SHOW':
            mainWindow.show();
            showHide = true;
            break;
    
        case 'HIDE':
            mainWindow.hide()
            showHide = false;
            break;

        case 'CLEAR_HISTORY':
          CLEAR_HISTORY();
          break;
        case 'AGENT_CLOSED':
              console.log('Agent Shutdown');
              mainWindow.destroy();
              break;
    
        
        case 'SHUTDOWN_PC':
            ACTION_SHUTDOWN()
            break;
        case 'CLEAN_KEY_CHAIN': 
            cleanKeyChain();
            break;
      default:

  }
  console.log(msg);
});
client.on('end', () => {
  console.log('CLIENT: I disconnected from the server.',cafeAgentId);
});