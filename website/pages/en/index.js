const React = require("react");
const stripIndent = require("strip-indent");

// The following file is injected by docusaurus during the build, see
// https://docusaurus.io/docs/en/api-pages.html#page-require-paths for details
const { Container, GridBlock } = require("../../core/CompLibrary.js");
const withBaseUrl = require(`${process.cwd()}/core/withBaseUrl.js`);
const siteConfig = require(`${process.cwd()}/siteConfig.js`);

const Button = props => (
    <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
            {props.children}
        </a>
    </div>
);

const HomeSplash = () => (
    <div className="homeContainer">
        <div className="homeSplashFade">
            <div className="wrapper homeWrapper">
                <div className="inner">
                    <h2 className="projectTitle">
                        {siteConfig.title}
                        <small>{siteConfig.tagline}</small>
                    </h2>
                    <div className="section promoSection">
                        <div className="promoRow">
                            <div className="pluginRowBlock">
                                <Button
                                    href={withBaseUrl(
                                        "/docs/getting-started.quickstart.html"
                                    )}
                                >
                                    {"get started"}
                                </Button>
                                <Button href="https://github.com/staticdeploy/staticdeploy">
                                    {"github"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Index = () => (
    <div>
        <HomeSplash />
        <div className="mainContainer">
            <Container padding={["bottom", "top"]}>
                <GridBlock
                    align="center"
                    contents={[
                        {
                            image: withBaseUrl("/images/home.deployments.svg"),
                            imageAlign: "top",
                            title: "Flexible Deployments",
                            content: stripIndent(`
                                Show people what you're working on! Deploy every
                                branch, tag, or even commit of your app, using
                                the url scheme that best fits your needs
                            `)
                        },
                        {
                            image: withBaseUrl(
                                "/images/home.configuration.svg"
                            ),
                            imageAlign: "top",
                            title: "Runtime Configuration",
                            content: stripIndent(`
                                Configuration at build time be gone! Define your
                                app's configuration in the StaticDeploy UI, and
                                have it injected into your bundles at runtime
                            `)
                        },
                        {
                            image: withBaseUrl("/images/home.routing.svg"),
                            imageAlign: "top",
                            title: "Smart Routing",
                            content: stripIndent(`
                                Was it **/static** or **./static**? Or should I
                                add the base url? Don't worry, StaticDeploy's
                                smart routing algorithm will find your content
                            `)
                        }
                    ]}
                    layout="fourColumn"
                />
            </Container>
        </div>
    </div>
);
module.exports = Index;
