const data = require("../data");
const Product = require("../modules/productsModules");
const userModules = require("../modules/userModules")

const getSeedController = async (req, res, next)=>{
    try {
        // delete all existing users
        await userModules.deleteMany({})

        // inserting all users
        const insertUsers = await userModules.insertMany(data.users)

        // successfully response
        return res.status(201).json({insertUsers})
    } catch (error) {
        next(error);
    }
}

const getProductsController = async (req, res, next)=>{
    try {
        // delete all existing Products
        await Product.deleteMany({})

        // inserting all Products
        const products = await Product.insertMany(data.products)

        // successfully response
        return res.status(201).json({products})
    } catch (error) {
        next(error);
    }
}

module.exports = {getSeedController, getProductsController}