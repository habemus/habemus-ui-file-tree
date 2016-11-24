/**
 * Definition of the the required hDev API
 */

// file and directory
exports.remove = 'function';
exports.move = 'function';

// file only
exports.readFile = 'function';
exports.createFile = 'function';

// directory only
exports.readDirectory = 'function';
exports.createDirectory = 'function';

// events
exports.subscribe = 'function';

// watching
exports.startWatching = 'function';
exports.stopWatching = 'function';

// project-related
exports.projectRootURL = 'string';
