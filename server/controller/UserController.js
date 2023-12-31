const bcrypt = require("bcrypt");
const User = require("../models/User");

const jwt = require('jsonwebtoken')

const RegisterUser = async (request, response) => {
  const { username, email, password } = request.body;
  try {
    const securePassword = await bcrypt.hash(password, 10);

    const userExist = await User.findOne({email})

    if (userExist){
      return response.status(422).json("User Exist...")
    }


    const user = new User({
      username,
      email,
      password: securePassword,
    });


    await user.save();
    console.log("user registered successfully ");
    
    response.status(200).json("!!!!!!!!!");
  } catch (error) {
    request.status(500).json({ error });
  }
};

const LoginUser = async (request, response) => {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ email });

    const jwtSecret = "jwtToken"


    if (!user) {
      return response.status(401).json("Could not found User in Db");
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return response.status(402).json("password not matched");
    }
    
    const token = jwt.sign({email:user.email},jwtSecret,{
      expiresIn:"20m"
    })
   
    

      response.status(200).json({token})
    

  } catch (error) {
    console.log("failed ");
  }
};

module.exports={RegisterUser,LoginUser}
