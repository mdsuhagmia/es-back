const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { defaultImagePath } = require("../secret");


const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [40, "Name length exceeded"]
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v){
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(v)
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, "Password must be at least 6 characters"],
        set: (v)=> bcrypt.hashSync(v, bcrypt.genSaltSync(10))
    },
    image: {
        type: String,
        default: defaultImagePath
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        minLength: [3, "Address must be at least 3 characters"],
    },
    phone: {
        type: String,
        required: [true, 'phone is required'],
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

const User = model('User', userSchema);
module.exports = User;