module.exports = function (happinessTree, rootModel, uiCore, options) {
  require('./branch')(happinessTree, rootModel, uiCore, options);
  require('./leaf')(happinessTree, rootModel, uiCore, options);
};
