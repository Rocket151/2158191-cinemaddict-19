import AbstractView from '../../framework/view/abstract-view.js';

function createPopupContainerTemplate() {
  return (
    `<section class="film-details"></section>`
  );
}

export default class PopupContainerView extends AbstractView {
  get template() {
    return createPopupContainerTemplate();
  }
}
