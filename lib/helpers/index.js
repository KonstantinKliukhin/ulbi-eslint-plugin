function isPathRelative(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../')
}

function getAlias(context) {
    if (context.options[0] && context.options[0].alias) {
        return context.options[0].alias;
    } else  {
        return '';
    }
}

module.exports = {
    getAlias,
    isPathRelative,
}
