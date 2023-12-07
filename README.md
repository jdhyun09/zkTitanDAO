<p align="center">
    <h1 align="center">
        (Demo) zkTitanDAO with Semaphore protocol
    </h1>
</p>

| The repository is divided into two components: [web app](./apps/web-app) and [contracts](./apps/contracts). The app allows users to create their own Semaphore identity, join a group and then send their feedback anonymously (currently on titan Goerli). |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

# OverView

![zkTitanDAO](/apps/web-app/public/zkTitanDAO_overview.png)

## 🛠 Install

Use this repository as a Github [template](https://github.com/semaphore-protocol/boilerplate/generate).

Clone your repository:

```bash
git clone https://github.com/<your-username>/<your-repo>.git
```

and install the dependencies:

```bash
cd <your-repo> && yarn
```

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables or run the app in a local network.

### Local server

### ⚠️ Caution

> Currently, zktitanDAO cannot be tested on localhost.
> If you want to test it locally, you must deploy the contract to titan_goerli.

You can start your app locally with:

### First, Deploy the contract only once(It's not localhost.)

Deploy the contract

1. Go to the `apps/contracts` directory and deploy your contract:

```bash
yarn deploy --network titan_goerli
```

2. Update your `.env` file with your new contract address and the semaphore contract address.

3. Copy your contract artifacts from `apps/contracts/build/contracts/contracts` folder to `apps/web-app/contract-artifacts` folders manually. Or run `yarn copy:contract-artifacts` in the project root to do it automatically.

### Second, Run the frontend locally.

```bash
yarn dev:web-app
```

---
### Contract test
1. Go to the `apps/contracts` directory and deploy your contract:
```bash
yarn test
# or
yarn test:report-gas
# or
yarn test:coverage
```


### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to automatically format the code:

```bash
yarn prettier:write
```
