To create user passwords, run the following script in a local node console:

var NodePbkdf2 = require("node-pbkdf2")
var hasher = new NodePbkdf2({ iterations: 10000, saltLength: 12, derivedKeyLength: 30 });
hasher.encryptPassword("NEWPASSWORD", function (err, e1) { console.log(e1); });

You will see the hashed string for NEWPASSWORD printed to the console.