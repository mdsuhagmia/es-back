const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const { serverPort } = require("./src/secret");

app.listen(serverPort, async ()=>{
    console.log(`Server is running at http://localhost:${serverPort}`);
    await connectDatabase();
})