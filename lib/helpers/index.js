const micromatch = require("micromatch");

function isPathRelative(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../')
}

function getIsIgnoredFile(ignoreFilesPatterns, currentFilePath) {
    return ignoreFilesPatterns.some(ignorePattern => micromatch.isMatch(currentFilePath, ignorePattern));
}

module.exports = {
    isPathRelative,
    getIsIgnoredFile,
}
