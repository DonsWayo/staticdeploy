import convroute from "common/convroute";
import App from "models/App";

export default convroute({
    path: "/apps/:appId",
    method: "get",
    description: "Get app",
    tags: ["apps"],
    parameters: [
        {
            name: "appId",
            in: "path",
            type: "string"
        }
    ],
    responses: {
        "200": { description: "Returns the app" },
        "404": { description: "App not found" }
    },
    handler: async (req, res) => {
        const { appId } = req.params;
        const app = await App.findById(appId);
        if (app) {
            res.status(200).send(app);
        } else {
            res.status(404).send({
                message: `No app found with id = ${appId}`
            });
        }
    }
});
