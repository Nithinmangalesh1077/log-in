const jwt =require('jsonwebtoken');

// const secrets=require('../vault');

const JWT_KEY='123nithin';

const bcrypt=require('bcryptjs');

const blocklist=[];



function verifyToken(req,res,next){

    let token=req.body.token || req.query.token|| req.headers["x-access-token"];



    if(blocklist.includes(token))

    {

        return res.send("Token Blacklisted... login again to get new");

    }

   

    try {

        token=token.substr(7);

        console.log(token)

        const decodedData=jwt.verify(token,JWT_KEY);

        req.user_name=decodedData.name;

        req.user_role=decodedData.role;

        console.log("From token "+decodedData.name+" and "+decodedData.role)

    } catch (error) {
        if(error.expiredAt)

        {

            console.log("Token Expired")

            return res.status(408).send("Token Expired Please Login Agin")

        }

        return res.status(401).send("Invalid token");

    }

    return next();

};

async function validateAndEncryptPwd(req,res,next){

    let password=req.body.password;

    let regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;



    if(!regularExpression.test(password))

    {

        res.json({

            message:"Password should be Valid"

        })

        return;

    }



    try {

        let encryptedPwd= await bcrypt.hash(password,5);

        req.body.password=encryptedPwd;

    } catch (error) {

        console.log("Error at encryption")
        res.json({

            message:"Error happens when Encrypting Password "

        })

        return;

    }



    return next();



}

//to remove expired blocklisted tokens

function removeBlocklist()

{

    console.log("Blocklist with Expired")

  for (let index = 0; index < blocklist.length; index++) {

      const token = blocklist[index];
      jwt.verify(token,JWT_KEY, function(err,data){

        if(err)

        {

            console.log(err)

            blocklist.splice(index,1);

        }

    });

}

}

module.exports={

verifyToken,

validateAndEncryptPwd,

removeBlocklist

};