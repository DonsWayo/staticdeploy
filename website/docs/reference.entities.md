---
id: reference.entities
title: Entities
---

### Bundles

Bundles are tar.gz archives of static content, plus associated metadata
describing them (a name, a tag, a description, etc.). Conceptually bundles are
equivalent to docker images.

Bundles can be created with the `create-bundle` command of the StaticDeploy cli,
by giving it a folder that gets archived into a tar.gz and uploaded to the
StaticDeploy backend.

### Entrypoints

Entrypoints are the urls at which the StaticDeploy backend serves the static
content of bundles. Each entrypoint is characterized by two properties:

* `bundleId`: the id of the bundle to serve
* `urlMatcher`: a domain + path combination against which incoming requests are
  matched to determine wether or not they should be served the static content of
  the entrypoint's bundle

Entrypoints may specify a configuration, a `(string, string)` dictionary that is
injected at serve-time into the html files of the bundle.

Entrypoints can be created manually from StaticDeploy's admin console, or
automatically when deploying a bundle with the `deploy` command of the
StaticDeploy cli.

### Apps

Apps are groups of entrypoints. Apps define a default configuration to be used
for entrypoints which don't define one.

Apps can be created manually from StaticDeploy's admin console, or automatically
when deploying a bundle with the `deploy` command of the StaticDeploy cli.
