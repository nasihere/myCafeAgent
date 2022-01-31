const { validateSecretKey, readKeyChain, writeKeyChain } = require('./index-keychain');

let cafeAgentId = null;
readKeyChain((err, data) => {
  if (err) {
    mainWindow.loadFile('admin-keychain.html');
  }
  else {
    cafeAgentId = data;
     
  }
})
// Node.js socket client script
const net = require('net');
// Connect to a server @ port 9898
const client = net.createConnection({ port: 9898 }, () => {
  console.log('CLIENT: I connected to the server.');
  client.write('CLIENT: Hello this is client!');
});
client.on('data', (data) => {
  let msg = JSON.parse(data);
  const agentid = msg.agentid;
  if (cafeAgentId != agentid) return;
  const action = msg.action;
  switch(action) {
        case 'LOCK':

          break;
        case 'UNLOCK':
           break;
      
        case 'SHOW':
            break;
    
        case 'HIDE':
            break;
      default:

  }
  console.log(msg);
//   client.end();
});
client.on('end', () => {
  console.log('CLIENT: I disconnected from the server.');
});