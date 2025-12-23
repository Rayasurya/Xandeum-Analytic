
<h1 align="center">
  <a
    target="_blank"
    href="https://app.aixblock.io/"
  >
    <img
      align="center"
      alt="AIxBlock"
src="https://aixblock.io/assets/images/logo-img.svg"
      style="width:25%;"
    />
    
  </a>
</h1>

## To run project

- Run `docker-compose -f docker-compose.dev.yml up --build -d` to start database and redis

- Copy `.env.example` to `.env` and update necessary variables

- Install dependencies: `npm install --legacy-peer-deps`

- Run backend: `npm run serve:backend`

- Run frontend: `npm run serve:frontend`

- Run engine: `npm run serve:engine`

- Or you can use `npm run dev` to start all `backend` and `frontend` and `engine`

- Your local server start at `http://127.0.0.1:4200/`

- Default account is
```
username: dev@aixblock.com
password: 12345678
```

## To develop new block
- Create new block by using script: `npm run create-block`

Example with block naming `ice`:
```
? Enter the block name: ice
? Enter the package name: workflow-ice
? Select the block type: community
```

- New directory will be created in `packages/blocks/community/ice`. You can start to define your triggers or your actions in this folder
- To testing new block in local, try to set `AP_DEV_BLOCKS="ice"` and `AP_BLOCKS_SOURCE="FILE"`
- It will have hot reload after you make some changes in `ice` block

## To install and deploy new block
- With above step you just create new block and using it in local environment. For production, you need to build block and install in application.

- In here, we are supporting two methods for `NPM registry` and `Packed Archive (.tgz)` 

### With packed archive
- With `Packed Archive (.tgz)`, you must pack you block before install:

- To build block `npm run build-block`
```
❯ npm run build-block

> aixblock-workflow@0.50.9 build-block
> npx ts-node packages/cli/src/index.ts blocks build

? Enter the block folder name ice
Block 'ice' built and packed successfully at dist/packages//blocks/community/ice.
```
- Then in directory `dist/packages//blocks/community/ice` it will have a file `workflow-ice-<version>.tgz`. You can use this file to install this block in application
![alt text](/assets/packed-archive.png)

### With NPM registry
- Create your npm account in `https://www.npmjs.com/`
- Run `npm login` to authenticate `npmjs`
- Run `npm run publish-block` to publish latest version of `ice` to your npmjs
- With `NPM registry`, you can use the external block and install it to your application
![alt text](/assets/npm-registry.png)


- NOTE: Application only supports installing libraries with newer versions, you cannot overwrite previously installed libraries.