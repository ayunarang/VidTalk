const User= require('../models/User.js');


exports.signin = async (req, res) => {
    const { googleId, name, email, avatar } = req.body;
  
    try {
      let user = await User.findOne({ email });
      
      if (!user) {
        user = await User.create({
          googleId,
          name,
          email,
          avatar,
        });
        console.log("New user created in backend");
      } else {
        console.log("Existing user found in backend");
      }

      const userId= user._id;
  
      res.status(200).send({ message: "User authenticated", userId });
    } catch (error) {
      console.error("Error handling user in backend:", error);
      res.status(500).send({ message: "Server error" });
    }
}

  