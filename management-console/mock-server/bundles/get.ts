import { RequestHandler } from "express";
import faker from "faker";
import { range } from "lodash";

const names = range(10).map(() => faker.lorem.word());
const tags = range(10).map(() => faker.lorem.word());
const bundles = range(1000).map(() => ({
    id: faker.random.alphaNumeric(8),
    name: faker.random.arrayElement(names),
    tag: faker.random.arrayElement(tags),
    createdAt: faker.date.past()
}));

export default ((_req, res) => {
    if (Math.random() > 0.9) {
        res.status(400).send({ message: "Random error" });
    } else {
        res.status(200).send(bundles);
    }
}) as RequestHandler;
