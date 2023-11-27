import { task, types } from "hardhat/config"

task("deploy", "Deploy a Feedback contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("group", "Group id", "42", types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = semaphore.address
        }

        if (!groupId) {
            groupId = process.env.GROUP_ID
        }

        const zkTitanDAOFactory = await ethers.getContractFactory("ZKTitanDAO")

        const ZkTitanDAOContract = await zkTitanDAOFactory.deploy(semaphoreAddress, groupId)

        await ZkTitanDAOContract.deployed()

        if (logs) {
            console.info(`Feedback contract has been deployed to: ${ZkTitanDAOContract.address}`)
        }

        return ZkTitanDAOContract
    })
