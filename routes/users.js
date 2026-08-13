const { models } = require("../database");
const express = require("express");
const { Sequelize, Op } = require("sequelize");
const bcrypt = require("bcryptjs");

const {
  Users,
  Zone,
  User_Type,
  Liste,
  UsersZone,
  ObjectifVd,
} = models;

const router = express.Router();
const validator = require("../midelware/validator");
const {
  CLIENT_IGNORE_SIGPIPE,
} = require("mysql/lib/protocol/constants/client");
const liste = require("../models/liste");

/*router.post("/getAllUsers", validator, async (req, res) => {
  const { userTrans, zoneSelected, typeDlgSelected } = req.body;


try {
  if (userTrans.type == 1 || userTrans.type == 1001) {
    // Create the base where condition
    let whereCondition = {
      active: 1,
      type: {
        [Op.in]: [2, 3, 4],
      },
      zone2: {
        [Op.in]: [1, 3, 2],
      },
    };
    
    // Check if zoneSelected is not empty and use it
    if (zoneSelected && zoneSelected.length > 0) {
      whereCondition.zone2 = {
        [Op.in]: zoneSelected,
      };
    }
    
    // Check if typeDlgSelected is not empty and use it
    if (typeDlgSelected && typeDlgSelected.length > 0) {
      whereCondition.type = {
        [Op.in]: typeDlgSelected,
      };
    }
    
    const allProspects = await Users.findAll({
      where: whereCondition,
      include: [
        {
          model: User_Type,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
    });
    res.status(200).json(allProspects);
  }
   else if (userTrans.type == 2 && userTrans.sup == 1) {
    // Create the base conditions
    let andConditions = [
      { active: 1 },
      { zone2: userTrans.zone2 }
    ];
    
    // Check if zoneSelected is not empty and use it
   
    
    // Create the OR condition for types
    let typeCondition = {
      type: { [Op.in]: [2, 3, 4] }
    };
    
    // Check if typeDlgSelected is not empty and use it
    if (typeDlgSelected && typeDlgSelected.length > 0) {
      typeCondition = {
        type: { [Op.in]: typeDlgSelected }
      };
    }
    
    const allProspects = await Users.findAll({
      where: {
        [Op.and]: [
          ...andConditions,
          {
            [Op.or]: [
              typeCondition,
              { id: userTrans.id },
            ],
          },
        ],
      },
      include: [
        {
          model: User_Type,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
    });
    res.status(200).json(allProspects);
 
  } 
  else if (userTrans.type == 2 && userTrans.sup == 0) {
    // Create base user conditions
    let userWhereCondition = {
      active: 1,
      type: {
        [Op.in]: [2, 3, 4],
      }
    };
    
    // Check if zoneSelected is not empty and use it
    if (zoneSelected && zoneSelected.length > 0) {
      userWhereCondition.zone2 = {
        [Op.in]: zoneSelected
      };
    }
    
    // Check if typeDlgSelected is not empty and use it
    if (typeDlgSelected && typeDlgSelected.length > 0) {
      userWhereCondition.type = {
        [Op.in]: typeDlgSelected
      };
    }
    
    const users = await Liste.findAll({
      where: {
        supID: userTrans.id,
      },
      include: [
        {
          model: Users,
          as: "user",
          where: userWhereCondition,
          attributes: {
            exclude: ["password", "pass", "login", "pwd_hashed"],
          },
          include: [
            {
              model: User_Type,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });
    
    res.status(200).json(users);
  }else{


    const allProspects = await Users.findAll({
      where: {
        id: userTrans.id
      },
      include: [
        {
          model: User_Type,
          attributes: ["id", "name"],
        },
      ],
      attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
    });
    
    res.status(200).json(allProspects);
  }
} catch (error) {
  // Add error handling
  console.error("Error:", error);
  res.status(500).json({ error: "An error occurred while fetching data" });
}
});*/
router.post("/getAllUsersORigin", validator, async (req, res) => {
  const { userTrans } = req.body;

  try {
    const currentYear = new Date().getFullYear(); // Get current year

    if (
      userTrans.type == 1001 ||
      (userTrans.type == 1 && userTrans.zone2 == 0)
    ) {
    
      const allProspects = await Users.findAll({
        where: {
          active: 1,
          type: {
            [Op.in]: [2, 3, 4],
          },
          zone2: {
            [Op.in]: [1, 3, 2,16],
          },
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });

      // Get BU data for all users
      const userIds = allProspects.map((user) => user.id);
      const usersBu = await UsersZone.findAll({
        where: {
          user: {
            [Op.in]: userIds,
          },
          year: currentYear,
        },
        attributes: ["user", "bu"],
      });

      // Create a map of user BUs
      const buMap = {};
      usersBu.forEach((ub) => {
        if (!buMap[ub.user]) {
          buMap[ub.user] = [];
        }
        buMap[ub.user].push(ub.bu);
      });

      // Inject BU data into users
      const prospectsWithBu = allProspects.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = buMap[user.id] || [];
        return userObj;
      });

      res.status(200).json(prospectsWithBu);
    } else if (
      (userTrans.type == 2 && userTrans.sup == 1) ||
      (userTrans.type == 1 && userTrans.zone2 != 0)
    ) {
      const allProspects = await Users.findAll({
        where: {
          [Op.and]: [
            { active: 1 },
            { zone2: userTrans.zone2 },
            {
              [Op.or]: [
                {
                  type: {
                    [Op.in]: [2, 3, 4],
                  },
                },
                {
                  id: userTrans.id,
                },
              ],
            },
          ],
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });

      // Get BU data for all users
      const userIds = allProspects.map((user) => user.id);
      const usersBu = await UsersZone.findAll({
        where: {
          user: {
            [Op.in]: userIds,
          },
          year: currentYear,
        },
        attributes: ["user", "bu"],
      });

      // Create a map of user BUs
      const buMap = {};
      usersBu.forEach((ub) => {
        if (!buMap[ub.user]) {
          buMap[ub.user] = [];
        }
        buMap[ub.user].push(ub.bu);
      });

      // Inject BU data into users
      const prospectsWithBu = allProspects.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = buMap[user.id] || [];
        return userObj;
      });

      res.status(200).json(prospectsWithBu);
    } else if (userTrans.type == 2 && userTrans.sup == 0) {
      // Get all users under this supervisor
      const users = await Liste.findAll({
        where: {
          supID: userTrans.id,
        },
        attributes: [],
        include: [
          {
            model: Users,
            as: "user",
            where: {
              active: 1,
              type: {
                [Op.in]: [2, 3, 4],
              },
            },
            attributes: {
              exclude: ["password", "pass", "login", "pwd_hashed"],
            },
            include: [
              {
                model: User_Type,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      // Get the supervisor user details
      const usersSup = await Users.findOne({
        where: {
          id: userTrans.id,
        },
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
      });

      // Extract user data from Liste results
      const usersData = users.map((liste) => liste.user);

      // Combine supervisor with subordinate users
      const combinedUsersData = usersSup ? [usersSup, ...usersData] : usersData;

      // Get BU data for all users
      const userIds = combinedUsersData.map((user) => user.id);
      const usersBu = await UsersZone.findAll({
        where: {
          user: {
            [Op.in]: userIds,
          },
          year: currentYear,
        },
        attributes: ["user", "bu"],
      });

      // Create a map of user BUs
      const buMap = {};
      usersBu.forEach((ub) => {
        if (!buMap[ub.user]) {
          buMap[ub.user] = [];
        }
        buMap[ub.user].push(ub.bu);
      });

      // Inject BU data into users
      const usersWithBu = combinedUsersData.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = buMap[user.id] || [];
        return userObj;
      });

      res.status(200).json(usersWithBu);
    } else {
      const allProspects = await Users.findAll({
        where: {
          id: userTrans.id,
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });

      // Get BU data
      const usersBu = await UsersZone.findAll({
        where: {
          user: userTrans.id,
          year: currentYear,
        },
        attributes: ["bu"],
      });

      // Inject BU data
      const prospectsWithBu = allProspects.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = usersBu.map((ub) => ub.bu);
        return userObj;
      });

      res.status(200).json(prospectsWithBu);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllUsers", validator, async (req, res) => {
  const { userTrans, type } = req.body;

  try {
    const currentYear = new Date().getFullYear(); // Get current year

    // Determine which types to filter by
    const userTypes =
      type && Array.isArray(type) && type.length > 0 ? type : [2, 3, 4];

    if (
      userTrans.type == 1001 ||
      (userTrans.type == 1 && (userTrans.zone2 == 0  || userTrans.zone2 == null))
    ) {

  
      const allProspects = await Users.findAll({
        where: {
          active: 1,
          type: {
            [Op.in]: userTypes,
          },
          zone2: {
            [Op.in]: [1, 3, 2,16],
          },
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
        order: [["Nom", "ASC"]],
      });

      // Get BU data for all users
      const userIds = allProspects.map((user) => user.id);
      const usersBu = await UsersZone.findAll({
        where: {
          user: {
            [Op.in]: userIds,
          },
          year: currentYear,
        },
        
        attributes: ["user", "bu"],
      });

      // Create a map of user BUs
      const buMap = {};
      usersBu.forEach((ub) => {
        if (!buMap[ub.user]) {
          buMap[ub.user] = [];
        }
        buMap[ub.user].push(ub.bu);
      });

      // Inject BU data into users
      const prospectsWithBu = allProspects.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = buMap[user.id] || [];
        return userObj;
      });

      res.status(200).json(prospectsWithBu);
    } else if (
      (userTrans.type == 2 && userTrans.sup == 1) ||
      (userTrans.type == 1 && userTrans.zone2 != 0)
    ) {
      const allProspects = await Users.findAll({
        where: {
          active: 1,
          zone2: userTrans.zone2,
          type: {
            [Op.in]: userTypes,
          },
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
        order: [["Nom", "ASC"]],
      });

      // Get BU data for all users
      const userIds = allProspects.map((user) => user.id);
      const usersBu = await UsersZone.findAll({
        where: {
          user: {
            [Op.in]: userIds,
          },
          year: currentYear,
        },
        attributes: ["user", "bu"],
      });

      // Create a map of user BUs
      const buMap = {};
      usersBu.forEach((ub) => {
        if (!buMap[ub.user]) {
          buMap[ub.user] = [];
        }
        buMap[ub.user].push(ub.bu);
      });

      // Inject BU data into users
      const prospectsWithBu = allProspects.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = buMap[user.id] || [];
        return userObj;
      });

      res.status(200).json(prospectsWithBu);
    } else if (userTrans.type == 2 && userTrans.sup == 0) {
      // Get all users under this supervisor
      const users = await Liste.findAll({
        where: {
          supID: userTrans.id,
        },
        attributes: [],
        include: [
          {
            model: Users,
            as: "user",
            where: {
              active: 1,
              type: {
                [Op.in]: userTypes,
              },
            },
            attributes: {
              exclude: ["password", "pass", "login", "pwd_hashed"],
            },
            include: [
              {
                model: User_Type,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      // Get the supervisor user details
      const usersSup = await Users.findOne({
        where: {
          id: userTrans.id,
        },
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
      });

      // Extract user data from Liste results
      const usersData = users.map((liste) => liste.user);

      // Combine supervisor with subordinate users
      const combinedUsersData = usersSup ? [usersSup, ...usersData] : usersData;

      // Get BU data for all users
      const userIds = combinedUsersData.map((user) => user.id);
      const usersBu = await UsersZone.findAll({
        where: {
          user: {
            [Op.in]: userIds,
          },
          year: currentYear,
        },
        attributes: ["user", "bu"],
      });

      // Create a map of user BUs
      const buMap = {};
      usersBu.forEach((ub) => {
        if (!buMap[ub.user]) {
          buMap[ub.user] = [];
        }
        buMap[ub.user].push(ub.bu);
      });

      // Inject BU data into users
      const usersWithBu = combinedUsersData.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = buMap[user.id] || [];
        return userObj;
      });

      usersWithBu.sort((a, b) => (a.Nom || "").localeCompare(b.Nom || ""));
      res.status(200).json(usersWithBu);
    } else {
      const allProspects = await Users.findAll({
        where: {
          id: userTrans.id,
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });

      // Get BU data
      const usersBu = await UsersZone.findAll({
        where: {
          user: userTrans.id,
          year: currentYear,
        },
        attributes: ["bu"],
      });

      // Inject BU data
      const prospectsWithBu = allProspects.map((user) => {
        const userObj = user.toJSON();
        userObj.user_bu = usersBu.map((ub) => ub.bu);
        return userObj;
      });

      res.status(200).json(prospectsWithBu);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllUsersType", validator, async (req, res) => {
  const { userTrans, type, zone } = req.body;

  const whereClause = {
    active: 1,
  };

  // Only add type filter if type is provided and is an array
  if (type && Array.isArray(type) && type.length > 0) {
    whereClause.type = {
      [Op.in]: type,
    };
  }

  // Only add zone filter if zone is provided and is an array
  if (zone && Array.isArray(zone) && zone.length > 0) {
    whereClause.zone2 = {
      [Op.in]: zone,
    };
  } else {
    whereClause.zone2 = {
      [Op.in]: [1, 2, 3],
    };
  }
  try {
    if (userTrans.type == 1 || userTrans.type == 1001) {
      const allProspects = await Users.findAll({
        where: whereClause,
        include: [
          {
            model: User_Type,
            // Utilisation de l'alias
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["type", "ASC"], // or 'DESC' for descending
        ],

        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });
      res.status(200).json(allProspects);
    } else if (userTrans.type == 2 && userTrans.sup == 1) {
      const allProspects = await Users.findAll({
        where: whereClause,
        include: [
          {
            model: User_Type,
            // Utilisation de l'alias
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["type", "ASC"], // or 'DESC' for descending
        ],

        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });
      res.status(200).json(allProspects);
    } else if (userTrans.type == 2 && userTrans.sup == 0) {
      // Get all users under this supervisor
      const users = await Liste.findAll({
        where: {
          supID: userTrans.id, // Filter for supervisor ID
        },
        attributes: [], // Don't select Liste attributes since we only want User data
        include: [
          {
            model: Users,
            as: "user", // Include user details
            where: whereClause,
            attributes: {
              exclude: ["password", "pass", "login", "pwd_hashed"],
            },
            include: [
              {
                model: User_Type,
                attributes: ["id", "name"], // Include User_Type details
              },
            ],
            order: [
              ["type", "ASC"], // or 'DESC' for descending
            ],
          },
        ],
      });

      // Get the supervisor user details
      const usersSup = await Users.findOne({
        where: {
          id: userTrans.id, // Filter for supervisor ID
        },
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        order: [["type", "ASC"]], // or 'DESC' for descending
      });

      // Extract user data from Liste results
      const usersData = users.map((liste) => liste.user);

      // Combine supervisor with subordinate users
      const combinedUsersData = usersSup
        ? [usersSup, ...usersData] // Include supervisor if found
        : usersData;

      res.status(200).json(combinedUsersData);
    } else {
      const allProspects = await Users.findAll({
        where: {
          id: userTrans.id,
        },
        include: [
          {
            model: User_Type,
            attributes: ["id", "name"],
          },
        ],
        order: ["type"], // or 'DESC' for descending
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });

      res.status(200).json(allProspects);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/typeUser", validator, async (req, res) => {
  const { userTrans } = req.body;
  try {
    const usersType = await User_Type.findAll({
      where: {
        id: [2, 3, 4, 5], // Filter for supervisor ID
      },
    });
    res.status(200).json(usersType);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/userInfo", validator, async (req, res) => {
  const { id } = req.body;
  try {
    const usersType = await Users.findOne({
      where: {
        id: id, // Filter for supervisor ID
      },
    });
    res.status(200).json(usersType);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getZone", validator, async (req, res) => {
  try {
    const zone = await Zone.findAll({
      where: {
        id: [1, 2, 3],
      },
    });

    res.json(zone);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getObjVd", validator, async (req, res) => {
  const { year } = req.body;
  try {
    const data = await ObjectifVd.findAll({
      where: { annee: year },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/addObjVd", validator, async (req, res) => {
  const { year, idDlg, obj } = req.body;
  try {
    const record = await ObjectifVd.create({
      annee: year,
      idDlg,
      obj,
    });
    res.status(200).json(record);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/updateObjVd", validator, async (req, res) => {
  const { id, obj } = req.body;
  try {
    await ObjectifVd.update({ obj }, { where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
