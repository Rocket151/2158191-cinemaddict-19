import AbstractView from '../framework/view/abstract-view.js';

function createFilterItemTemplate(filter, isChecked) {
  const {name, count} = filter;

  return (
    `<a href="#${name}" class="main-navigation__item" ${isChecked ? 'main-navigation__item--active' : ''}${count === 0 ? 'disabled' : ''}>${name === 'all' ? 'All movies</a>' : `${name}<span class="main-navigation__item-count">${count}</span></a>`}`
  );
}

function createFilterTemplate(filterItems) {
  const filterItemsTemplate = filterItems
    .map((filter, index) => createFilterItemTemplate(filter, index === 0))
    .join('');

  return (
    `<nav class="main-navigation">
      ${filterItemsTemplate}
    </nav>`
  );
}

export default class MenuView extends AbstractView {
  #filters = null;

  constructor(filters) {
    super();
    this.#filters = filters;
  }

  get template() {
    return createFilterTemplate(this.#filters);
  }
}
