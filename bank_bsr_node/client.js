var soap = require('soap');
var url = 'http://localhost:8001/bank?wsdl';
// var Cookie = require('soap-cookie');

soap.createClient(url, (err, client) => {

  if (err) {
    console.log(err);
    throw err;
  }
  client.setSecurity(new soap.BasicAuthSecurity('d', 'd'));
  // client.createUser({ username: "d", password: "d" }, (err, res) => {
  //   console.log(res.result);
  // });
  client.login({ username: "d", password: "d" }, (err, res) => {
    if (err) throw err;

    client.setSecurity(new soap.BasicAuthSecurity('d', 'd'));
    // client.createAccount(null, (err, res) => {
    //   if (err) {
    //     console.log(err);
    //     throw err;
    //   }

    //   if (res.result)
    //     console.log('accountCreated');
    // });
    console.log('starting transfer');
    client.transferMoney({
      accountFrom: "05001097810000000000000001",
      accountTo: "05001111220000000000000001",
      title: "payment",
      amount: 10
    }, (err, res) => {
      console.log('transfer result')
      if (err) throw err;
      console.log(res);
    });
    // client.getAccountHistory({ accountNumber: "05001097810000000000000000" }, (err, res) => {
    //   if (err) throw err;
    //   console.log(res.transactions);
    // });
    // client.getAccountHistory({ accountNumber: '05001097810000000000000002' }, (err, res) => {
    //   if (err) throw err;
    //   console.log(res);
    // });
  });

  // console.log(client.describe().bank.accountService);
  // client.login({ username: "d", password: "a" }, (err, res) => {
  //   // if (err) throw err;
  //   console.log(res.result);
  //   // console.log(client.lastResponseHeaders)
  //   // client.setSecurity(new soap.BasicAuthSecurity('username', 'password'));
  //   // client.setSecurity();
  // client.getList(null, (err, res) => {
  //   if (err) throw err;
  //   console.log(res.list);
  // });
  // });

  // client.setSecurity(
  //   // new soap.BasicAuthSecurity('username', 'password')
  //   new soap.WSSecurity('username', 'password', null));
  // // console.log(client.describe().bank.accountService);
  // // client.multiplicar({a: 4,b: 3},function(err,res){
  // //     if (err) throw err;
  // //     console.log(res);
  // // });
  // // client.sumar({a: 4,b: 3},function(err,res){
  // //     if (err) throw err;
  // //     console.log(res);
  // // });
  // // client.getTime(null, function(err,res){
  // //     if (err) throw err;
  // //     console.log(res);
  // // });
  // client.getList(null, (err,res) => {
  //     if (err) throw err;
  //     console.log(res.list);
  // });
});