const Users = require("../models/userModel")
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
  try{
    const token = req.header("Authorization")
  if(!token) return res.status(400).json({msg: "Invalid Authentication."})

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  if(!decoded) return res.status(400).json({msg: "Invalid Authentication."})

  const user = await Users.findOne({_id: decoded.id})
  if(!user) return res.status(400).json({msg: "User not found."})

  // Kiểm tra xem user đăng nhập có phải là user B không
  if(req.params.userId && req.params.userId !== user._id.toString()) {
      return res.status(401).json({msg: "Unauthorized."})
  }
  
  req.user = user
  next()
} catch (err) {
  return res.status(500).json({msg: err.message})
};
}

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error("Not authorized as an Admin");
    }
  };


module.exports = {auth, admin}