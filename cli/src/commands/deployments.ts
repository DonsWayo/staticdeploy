import yargs = require("yargs");

export const command = "deployments <command>";
export const describe = "Manage deployments";
export const builder = (yarg: yargs.Argv) => {
    return yarg.commandDir("./deployments");
};
