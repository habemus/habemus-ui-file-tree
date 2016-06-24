module.exports = function (rootModel, ui) {


  ui.addTreeEventListener('dragstart', 'leaf', function (data) {

    data.element.classList.add(ui.DRAGGING);

    console.log('dragstart on leaf', data.element, data.path);
  });

  ui.addTreeEventListener('dragend', 'leaf', function (data) {
    data.element.classList.remove(ui.DRAGGING);
  });

};
