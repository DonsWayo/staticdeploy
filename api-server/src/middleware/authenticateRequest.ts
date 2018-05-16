import { RequestHandler } from "express";
import jwt from "express-jwt";

export default function authenticateRequest(jwtSecret: Buffer): RequestHandler {
    const jwtMiddleware = jwt({
        secret: jwtSecret,
        credentialsRequired: true
    });
    return (req, res, next) => {
        jwtMiddleware(req, res, err => {
            if (err) {
                res.status(401).send({ message: err.message });
            } else if (!req.user.sub) {
                res.status(401).send({
                    message: "JWT must specify a subject (sub)"
                });
            } else {
                next();
            }
        });
    };
}
