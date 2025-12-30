require("dotenv").config()

const serverPort = process.env.SERVER_PORT || 4000

const mongodbURL = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/esbackproject'

const defaultImagePath = process.env.DEFAULT_IMAGE_PATH

const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || 'lkjhgfdsa0987654321'

const jwtAccessKey = process.env.JWT_ACCESS_KEY || 'asdfghjkl1234567890oooo'

const jwtRefresTokenKey = process.env.JWT_REFRESH_TOKEN_KEY || 'asdfghjkl1234567890oooo'

const jwtResetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || 'asdfghjkl1234567890oooo'

const smtpUsername = process.env.SMTP_USERNAME || ''
const smtpPassword = process.env.SMTP_PASSWORD || ''

const clientUrl = process.env.CLIENT_URL || ''

module.exports = {serverPort, mongodbURL, defaultImagePath, jwtActivationKey, jwtAccessKey, smtpUsername, smtpPassword, clientUrl, jwtResetPasswordKey, jwtRefresTokenKey};