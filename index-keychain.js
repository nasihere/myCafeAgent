const {ipcMain} = require('electron');
const fs = require('fs')

exports.readKeyChain = (callback) => {
    fs.readFile('init-chain.ini', 'utf8' , (err, data) => {
    if (err) {
        
        console.error(err)
        callback(err, null);
        return
    }
    console.log(data)
    callback(null, data);
    })
}

exports.writeKeyChain = (content) => {
    fs.writeFile('init-chain.ini', content, err => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
      
      
}

exports.cleanKeyChain = (content) => {
  fs.unlink('init-chain.ini', content, err => {
      if (err) {
        console.error(err)
        return
      }
      //file written successfully
    })
    
    
}

exports.validateSecretKey = (key) => {
  return true;
}
