const startingSlashRegExp = /^\//;
const trailingSlashRegExp = /\/$/;
const slashesRegExp = /(^\/)|(\/$)/g;

// function trimStart(p) {
//   return p.replace(startingSlashRegExp, '');
// }

// function trimTrailing(p) {
//   return p.replace(trailingSlashRegExp, '');
// }

function trim(p) {
  return p.replace(slashesRegExp, '');
}

function splitPath(p) {
  return trim(p).split('/');
};

// exports.trimStart = trimStart;
// exports.trimTrailing = trimTrailing;
exports.trim = trim;
exports.splitPath = splitPath;
