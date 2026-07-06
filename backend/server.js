const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();


const app = require("./src/app");
const connectToDB = require("./src/config/db");
const invokeGeminiAi = require("./src/services/ai.service")

connectToDB();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});