// var axios = require('axios')
var CryptoJS = require('crypto-js')
var timestamp = new Date().getTime()


  var space = " ";				// one space
  var newLine = "\n";				// new line
  var method = "POST";				// method
  var url = "https://sens.apigw.ntruss.com/sms/v2/services/ncp:sms:kr:263359313400:preventra_alram/messages";	// url (include query string)
  var timestamp = String(_timestamp);			// current timestamp (epoch)
  var accessKey = "nYq0zSe9PCZ8RzdLiPE2";			// access key id (from portal or Sub Account)
  var secretKey = "7jYX4EiSNdO0nECO8iRmbvsHNBupcB8dqECgg2lq";			// secret key (from portal or Sub Account)
  var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);
  var hash = hmac.finalize();
  return hash.toString(CryptoJS.enc.Base64);


// var url = 'https://sens.apigw.ntruss.com/sms/v2/services/ncp:sms:kr:263359313400:preventra_alram/messages'
// var data = {
//   "type":"SMS",
//   "from":"01076407232",
//   "content":"Hello World", 
//   "messages":[
//     {
//         "to":"01076407232",
//     }
//   ]
// }
// axios.post(url, data,
//   {
//     headers: {
//       'Content-Type': 'application/json; charset=utf-8',
//       'x-ncp-apigw-timestamp':  String(timestamp),
//       'x-ncp-iam-access-key': 'nYq0zSe9PCZ8RzdLiPE2',
//       'x-ncp-apigw-signature-v2': getSignature(timestamp)
//   }
//   }).then(res => {
//     console.log(res.data)
//   })