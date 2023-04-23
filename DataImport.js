const express = require("express");
const User = require("./models/userModel");

const ImportData = express.Router();

const adminUser = {
  fullname: "Lam Minh Huy",
  username: "admin",
  password: "1234567",
  email: "admin@example.com",
  isAdmin: true,
};

ImportData.post("/admin", async (req, res) => {
  try {
    const admin = await User.create(adminUser);
    res.send({ admin });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = ImportData;
