const { PrismaClient } = require("@prisma/client");

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["error"],
  });
}

prisma = global.prisma;
// console.log("Value: "+ Object.keys(prisma));
module.exports = { prisma };