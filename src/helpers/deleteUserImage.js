const fs = require("fs").promises;

const deleteUserImage = async (userImagePath) => {
  try {
    await fs.access(userImagePath);
    await fs.unlink(userImagePath);
    console.log("User image was deleted");
  } catch (error) {
    console.error("User image dose not exist");
  }
};
module.exports = deleteUserImage;
