const core = require('@actions/core');
const github = require('@actions/github');
const child_process = require("child_process");
const { listExecutables } = require("./cmake_targets");

try {
    const cmakeExecutable = core.getInput('cmake-executable');
    const buildFolder = core.getInput('build-folder');
    const sourceFolders = core.getInput('source-folders');
    const failFast = core.getInput('fail-fast');

    const executables = listExecutables(cmakeExecutable, buildFolder, sourceFolders);

    let failed = false;

    for (let i = 1; i <= executables.length; i++) {
        const executable = executables[i - 1];
        console.log("===============================================================================");
        console.log(`[${i}/${executables.length}] ${executable.name}`);
        console.log("-------------------------------------------------------------------------------");
        const result = child_process.spawnSync(`${buildFolder}/${executable.path}`, [buildFolder], { stdio: "inherit" });
        if (result.status != 0) {
            failed = true;
            console.log("-------------------------------------------------------------------------------");
            console.error(`Error: target returned ${result.status}`);
            if (failFast && i != executables.length) {
                console.error("'Fail fast' is active. Further targets won't be executed.");
                break;
            }
        }
    }

    console.log("-------------------------------------------------------------------------------");

    if (executables.length == 0) {
        console.warn("No targets were executed.");
    } if (failed) {
        console.error("Errors happened.");
        core.setFailed("One or more targets returned a non-zero value.");
    } else {
        console.log("All targets executed successfully.");
    }
} catch (error) {
    core.setFailed(error.message);
}