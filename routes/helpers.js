export const getDaysBetween = (dateBegin, dateEnd) => {
  const days = [];

  // French day names
  const frenchDays = [
    'dimanche', 'lundi', 'mardi', 'mercredi',
    'jeudi', 'vendredi', 'samedi'
  ];

  // French month names
  const frenchMonths = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  // Create new Date objects to avoid mutating the original dates
  const currentDate = new Date(dateBegin);
  const endDate = new Date(dateEnd);

  // Ensure the end date is after or equal to the start date
  if (currentDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  // Loop through each day from start to end (inclusive)
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const dayOfWeek = currentDate.getDay();

    // Format ISO date (YYYY-MM-DD)
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateISO = `${year}-${monthStr}-${dayStr}`;

    // Format French date (dimanche 01 juin 2025)
    const dayName = frenchDays[dayOfWeek];
    const monthName = frenchMonths[month];
    const dayFormatted = String(day).padStart(2, '0');
    const dateFormatted = `${dayName} ${dayFormatted} ${monthName} ${year}`;

    days.push({
      dateFormatted,
      dateISO
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};





export const getUsers= async (userTrans)=>{


  try {
    if (userTrans.type == 1001) {
      const allProspects = await Users.findAll({
        where: {
          active: 1,
          type: {
            [Op.in]: [2, 3, 4], // Adds the condition type IN (2, 3, 4)
          },
          zone2: {
            [Op.in]: [1, 3, 2], // Adds the condition type IN (2, 3, 4)
          },
        },
        include: [
          {
            model: User_Type,
            // Utilisation de l'alias
            attributes: ["id", "name"],
          },
        ],

        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });
     return allProspects
    } else if ((userTrans.type == 2 && userTrans.sup == 1) || (userTrans.type == 1 && userTrans.zone2 == 0)) {
      console.log("in sup1"); 
      const allProspects = await Users.findAll({
        where: {
          [Op.and]: [
            { active: 1 }, // Ensure the user is active
            { zone2: userTrans.zone2 }, // Match the zone2
            
          ],
        },
        include: [
          {
            model: User_Type,
            // Utilisation de l'alias
            attributes: ["id", "name"],
          },
        ],

        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });
      console.log(allProspects);
      return(allProspects);
    } else if ((userTrans.type == 2 && userTrans.sup == 0) ) {
      console.log("in sup0");
      console.log(userTrans);
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
            where: {
              active: 1, // Ensure active status
              type: {
                [Op.in]: [2, 3, 4], // Adds the condition type IN (2, 3, 4)
              },
            },
            attributes: {
              exclude: ["password", "pass", "login", "pwd_hashed"],
            },
            include: [
              {
                model: User_Type,
                attributes: ["id", "name"], // Include User_Type details
              },
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
      });

      // Extract user data from Liste results
      const usersData = users.map((liste) => liste.user);

      // Combine supervisor with subordinate users
      const combinedUsersData = usersSup
        ? [usersSup, ...usersData] // Include supervisor if found
        : usersData;
      console.log(combinedUsersData);
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
        attributes: { exclude: ["password", "pass", "login", "pwd_hashed"] },
      });

    return(allProspects);
    }
  } catch (error) {
    return({});
  }

}




