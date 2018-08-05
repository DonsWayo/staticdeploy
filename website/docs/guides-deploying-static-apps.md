---
id: guides-deploying-static-apps
title: Deploying static apps
---

[Having set up the StaticDeploy platform](/docs/guides-deploying-staticdeploy-with-docker),
we can now deploy our static apps on it.

## Setting up the cli

Apps are deployed using the StaticDeploy **cli**, which we can install from npm:

```sh
npm install --global @staticdeploy/cli
# Or if you prefer yarn
yarn global add @staticdeploy/cli
```

We need to provide the **cli** the address of our StaticDeploy **api-server**,
as well as a valid authentication token for making requests to the API. We can
do so by setting two environment variables:

```sh
export STATICDEPLOY_API_URL=https://staticdeploy.$MY_DOMAIN/api/
export STATICDEPLOY_API_TOKEN=my-jwt-auth-token
```

> Note: we're assuming we have an **api-server** listening at
> `https://staticdeploy.$MY_DOMAIN/api/`

## Deploying a static app

Deploying a static app is a two step process.

First, we need to create a bundle from the folder containing our static app. We
can do so with the `bundle` command of the cli, to which we also provide - aside
from the folder where our app is located - a name for the bundle, a tag, a
description, and the path of the fallback asset (which must exist in the
bundle):

```sh
staticdeploy bundle \
  --from my-static-app-folder \
  --name my-static-app \
  --tag master \
  --description "First bundle" \
  # If your fallback asset actually is /index.html, you can omit this option
  # since it defaults to /index.html
  --fallbackAssetPath /index.html
```

The command will package the static app into a tar.gz archive and upload it to
the StaticDeploy server, where it can now be deployed.

We can do so using the `deploy` command of the cli. The command takes three
arguments:

- a name for the app we want to deploy
- an entrypoint (i.e. a URL) where we want to deploy our app
- the name of the bundle that we wish to deploy to that entrypoint

```sh
staticdeploy deploy \
  --app my-static-app \
  --entrypoint my-static-app.com/ \
  --bundle my-static-app:master
```

The command will deploy the latest bundle with name `my-static-app` and tag
`master` to the entrypoint `my-static-app.com/`.

## Pointing the DNS to StaticDeploy's static-server

Now that we've deployed our static app, when StaticDeploy's **static-server**
receives requests for `my-static-app.com/`, it will respond with the appropriate
file in the bundle we've deployed.

We need however to make requests for `my-static-app.com/` get to StaticDeploy's
**static-server**. For this, we can simply point the DNS of `my-static-app.com`
to `staticdeploy.$MY_DOMAIN`.

## Improving performances with a CDN

StaticDeploy's **static-server** is not very efficient at serving static files.
Its main jobs are correctly routing requests and injecting configurations. It
also doesn't serve content via HTTPS.

For efficiently serving static content, as well as securing requests with HTTPS,
using a CDN is highly recommended. Using a CDN with StaticDeploy is fairly
simple: we just need to set our StaticDeploy installation as the source from
where the CDN gets the content, point the DNS of our app to the CDN, and
configure the CDN to pass-through to StaticDeploy the `Host` header of requests.
