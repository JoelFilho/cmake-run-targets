const fs = require("fs");
const child_process = require("child_process");

class Executable {
    constructor(name, path) {
        this.name = name;
        this.path = path;
    }
};

function listExecutables(cmakePath, buildFolder, filterFolders) {
    const apiPath = buildFolder + '/.cmake/api/v1/';

    // Create Query
    const queryFolder = apiPath + 'query/';
    const queryFile = queryFolder + 'codemodel-v2';
    fs.mkdirSync(queryFolder, { recursive: true });
    fs.closeSync(fs.openSync(queryFile, 'w'));

    // Run CMake
    const result = child_process.spawnSync(cmakePath, [buildFolder]);

    if (result.status != 0) {
        throw new Error("CMake query execution failed.\n"
            + `stdout:\n${result.stdout}`
            + `stderr:\n${result.stderr}`);
    }

    // Read files and select the executables
    const replyFolder = apiPath + 'reply/';

    if (!fs.existsSync(replyFolder))
        throw new Error("CMake did not respond to a query. Are you using CMake 3.15 or newer?");

    const targetFiles = fs.readdirSync(replyFolder)
        .filter(file => /^target-(.*)\.json$/.test(file))
        .map(file => replyFolder + file);

    let executables = [];

    filterFolders = Array.isArray(filterFolders) ? filterFolders : filterFolders.split('\n');
    filterFolders = filterFolders
        .filter(folder => folder.length > 0)
        .map(folder => (folder.slice(-1) == '/') ? folder : (folder + '/'));

    targetFiles.forEach(file => {
        const target = JSON.parse(fs.readFileSync(file));
        if (target.type != "EXECUTABLE")
            return;

        // Get files
        const sources = target.sources.filter(source => {
            if (filterFolders.length == 0)
                return true;
            for (const folder of filterFolders) {
                if (source.path.startsWith(folder))
                    return true;
            }
            return false;
        });

        if (sources.length == 0)
            return;

        const paths = target.artifacts.filter(artifact => artifact.path.endsWith(target.name));

        if (paths.length != 1)
            return;

        executables.push(new Executable(target.name, paths[0].path));
    });

    // Return list of executables
    return executables;
}

module.exports = {
    listExecutables
};