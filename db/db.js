const mongoose = require("mongoose");

function connectToDB(){
   mongoose.connect(process.env.DB_CONNECT) 
     .then(()=>{
        console.log("connected To Db")
     })
     .catch((err)=>{
       console.log(`unable to connect to DB ${err}`)
     })                                          
}

module.exports = connectToDB