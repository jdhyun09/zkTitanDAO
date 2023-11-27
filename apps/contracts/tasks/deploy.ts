import { task, types } from "hardhat/config"

task("deploy", "Deploy a zkTitanDAO contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = semaphore.address
        }

        const zkTitanDAOFactory = await ethers.getContractFactory("ZKTitanDAO")

        const ZkTitanDAOContract = await zkTitanDAOFactory.deploy(semaphoreAddress)

        await ZkTitanDAOContract.deployed()

        if (logs) {
            console.info(`zkTitanDAO contract has been deployed to: ${ZkTitanDAOContract.address}`)
        }

        return ZkTitanDAOContract
    })
