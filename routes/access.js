const express = require("express");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { models } = require("../database");
const { Users } = models;
const saltRounds = parseInt(process.env.salt);
const salt = bcrypt.genSaltSync(saltRounds);
const validator = require("../midelware/validator");
// Define a route to get all Users

router.post("/Users", async (req, res) => {
  try {
    const allUsers = await Users.findAll();
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/addUsers", validator, async (req, res) => {
  try {
    const newUser = await Users.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { login, pass } = req.body;

  try {
    const user = await Users.findOne({ where: { login: login, active: 1 } });

    if (!user) {
      res.json({ status: -1 });
    } else {
      const hashedPassword = await bcrypt.compare(pass, user.pwd_hashed);

      //const hashedPassword2 = await bcrypt.hash("gh@li@05", 12);
      // console.log("*"+hashedPassword+"*");

      if (hashedPassword) {
        const userTrans = {
          id: user.id,
          type: user.type,
          nom: user.Nom,
          prenom: user.Prenom,
          email: user.Email,
          zone: user.zone,
          zone2: user.zone2,
          sup: user.sup,
          departement: user.departement,
          timestamp: Date.now(),
        };
        // console.log(userTrans)
        const token = jwt.sign(userTrans, process.env.SECRET_KEY);

        /*res.cookie('jwt',token,(
                {httpOnly:false,secure:true,maxAge:60*60*1000} //    1000=millisecond     24*60*60*1000 a day
            ))*/

        res.json({ status: 1, token: token });
      } else {
        res.json({ status: -2 });
      }
    }

    // res.json(allUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getUserConnect", validator, async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];

    const claims = jwt.verify(cookie, process.env.SECRET_KEY);
    if (!claims) {
      return res.status(401).json({
        status: false,
        data: null,
      });
    } else {
      const user = await Users.findOne({ where: { id: claims.id } });
      return res.status(200).json({
        status: true,
        data: user,
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      data: null,
      message: "Invalid JWT token",
    });
  }
});
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ status: 1 });
});

module.exports = router;
