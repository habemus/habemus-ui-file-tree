module.exports = function (happinessTree, rootModel, uiCore) {
  require('./branch')(happinessTree, rootModel, uiCore);
  require('./leaf')(happinessTree, rootModel, uiCore);
};
