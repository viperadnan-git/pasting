<h1>Introduction</h1>
<p><b>Pasting</b> is a minimalist publishing tool that allows you to create richly formatted posts and push them to the Web in just a click.
In simple words it's a website like Telegraph but it can be used as a pastebin too.&nbsp;&nbsp;

<a href="https://go.deta.dev/deploy?repo=https://github.com/viperadnan-git/pasting">
    <img src="https://button.deta.dev/1/svg" alt="Deploy" height="26">
</a>

## Installing
It can be deployed on deta or you need node v16.13.0 or later and also need deta's project key if not deploying on deta.

### Configuration
- Set `HOST` and `PORT` in environment variables or in arguments. Default it will listen on `127.0.0.1:8000`.
- Set `DETA_PROJECT_KEY` in environment varibales.

### Deployment
- Install dependencies using `npm`
```
npm install
```
- Run it using `node`
```
node index.js
```

### Copyright & License
Copyright (©) 2022 by [Adnan Ahmad](https://github.com/viperadnan-git).
Licensed under the terms of the [MIT](./LICENSE)