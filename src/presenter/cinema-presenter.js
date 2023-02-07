import ShowMoreButtonView from '../view/button-show-more-view.js';
import SortView from '../view/sort-view.js';
import ContentView from '../view/content-view.js';
import FilmListContainerView from '../view/film-list-container.js';
import FilmListView from '../view/film-list-view.js';
import FooterStatisticsView from '../view/footer-statistics-view.js';
import MoviePresenter from './movie-presenter.js';
import ProfileRatingView from '../view/profile-rating-view.js';
import { render, remove } from '../framework/render.js';
import { sortMovieDateDown, sortMovieRatingDown } from '../utils/utile.js';
import { SortType, UserAction, UpdateType, FilterType } from '../const.js';
import FilterPresenter from './filter-presenter.js';
import { filters } from '../utils/filter.js';

const HeaderText = {
  [FilterType.ALL]: 'There are no movies in our database',
  [FilterType.FAVORITES]: 'There are no favorite movies now',
  [FilterType.HISTORY]: 'There are no watched movies now',
  [FilterType.WATCHLIST]: 'There are no movies to watch now',
};

const FILM_CARD_COUNT_PER_STEP = 5;

export default class СinemaPresenter {
  #mainContainer = null;
  #headerProfile = null;
  #footer = null;

  #moviesModel = null;
  #commentsModel = null;
  #filterModel = null;

  #moviePresenter = null;
  #filmListComponent = null;
  #showMoreButtonComponent = null;
  #headerProfileComponent = null;
  #sortComponent = null;
  #footerStatisticsComponent = null;

  #renderedFilmCardCount = FILM_CARD_COUNT_PER_STEP;
  #filterPresenter = null;
  #moviePresenters = new Map();
  #currentSortType = SortType.DEFAULT;
  #filterType = FilterType.ALL;
  #isLoading = true;

  #filmListContainerComponent = new FilmListContainerView();
  #contentComponent = new ContentView();

  constructor({headerProfile, mainContainer, footer, moviesModel, commentsModel, filterModel}) {
    this.#mainContainer = mainContainer;
    this.#headerProfile = headerProfile;
    this.#footer = footer;
    this.#moviesModel = moviesModel;
    this.#commentsModel = commentsModel;
    this.#filterModel = filterModel;
    this.#moviesModel.addObserver(this.#handleModelEvent);
    this.#commentsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  #renderHeaderProfile() {
    render(this.#headerProfileComponent = new ProfileRatingView(), this.#headerProfile);
  }

  #renderMenu() {
    this.#filterPresenter = new FilterPresenter({mainContainer: this.#mainContainer, moviesModel: this.#moviesModel, filterModel: this.#filterModel});
    this.#filterPresenter.init(this.moviesData);
  }

  #renderSort() {
    render(this.#sortComponent = new SortView({currentSortType: this.#currentSortType, onSortTypeChange: this.#handleSortTypeChange}), this.#mainContainer);
  }

  #renderFilmList() {
    this.#renderedFilmCardCount = FILM_CARD_COUNT_PER_STEP
    render(this.#contentComponent, this.#mainContainer);

    if (this.#isLoading) {
      this.#filmListComponent = new FilmListView('Loading...');

      render(this.#filmListComponent, this.#contentComponent.element);

      return;
    } else if (!this.moviesData.length) {
      this.#filmListComponent = new FilmListView(HeaderText[this.#filterType]);

      render(this.#filmListComponent, this.#contentComponent.element);

      return;
    }

    this.#filmListComponent = new FilmListView();

    render(this.#filmListComponent, this.#contentComponent.element);
    render(this.#filmListContainerComponent, this.#filmListComponent.element);

    for (let i = 0; i < Math.min(this.moviesData.length, this.#renderedFilmCardCount); i++) {
      this.#renderFilmCardWithPopup(this.moviesData[i]);
    }

    if (this.moviesData.length > this.#renderedFilmCardCount) {
      this.#showMoreButtonComponent = new ShowMoreButtonView({onShowMoreButtonClick: this.#HandleShowMoreButtonClick});

      render(this.#showMoreButtonComponent, this.#filmListContainerComponent.element);
    }
  }

  #renderFooterStatistics() {
    render(this.#footerStatisticsComponent = new FooterStatisticsView(this.moviesData.length), this.#footer);
  }


  #renderFilmCardWithPopup(movieData) {
    this.#moviePresenter = new MoviePresenter({
      filmListContainerComponent: this.#filmListContainerComponent.element,
      onDataChange: this.#handleViewAction,
      onPopupStateChange: this.#handlePopupStateChange,
      commentsModel: this.#commentsModel
    });
    this.#moviePresenter.init(movieData);
    this.#moviePresenters.set(movieData.id, this.#moviePresenter);
  }

  get moviesData() {
    this.#filterType = this.#filterModel.filter;
    const moviesData = [...this.#moviesModel.moviesData];
    const filteredMovies = filters[this.#filterType](moviesData);

    switch (this.#currentSortType) {
      case SortType.DATE:
        return filteredMovies.sort(sortMovieDateDown);
      case SortType.RATING:
        return filteredMovies.sort(sortMovieRatingDown);
      case SortType.DEFAULT:
        return filteredMovies;
    }
    return this.#moviesModel.moviesData;
  }

  #clearFilmList() {
    this.#moviePresenters.forEach((presenter) => presenter.destroy());
    this.#moviePresenters.clear();
    remove(this.#contentComponent);
    remove (this.#sortComponent);
    remove(this.#showMoreButtonComponent);
  }

  #HandleShowMoreButtonClick = (evt) => {
    evt.preventDefault();
    if (this.moviesData.length > this.#renderedFilmCardCount) {
      this.moviesData
        .slice(this.#renderedFilmCardCount, this.#renderedFilmCardCount + FILM_CARD_COUNT_PER_STEP)
        .forEach((movieData) => this.#renderFilmCardWithPopup(movieData));

      this.#filmListContainerComponent.element.appendChild(this.#showMoreButtonComponent.element);

      this.#renderedFilmCardCount += FILM_CARD_COUNT_PER_STEP;
    }

    if (this.#renderedFilmCardCount >= this.moviesData.length) {
      remove(this.#showMoreButtonComponent);
    }
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_MOVIE:
        this.#moviesModel.updateMovie(updateType, update);
        break;
      case UserAction.ADD_COMMENT:
        this.#commentsModel.addComment(updateType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this.#commentsModel.deleteComment(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#moviePresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#currentSortType = SortType.DEFAULT;
        this.#clearFilmList();
        this.#renderSort();
        this.#renderFilmList();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        this.#clearFilmList();
        remove (this.#footerStatisticsComponent);
        this.#renderSort();
        this.#renderFilmList();
        this.#renderFooterStatistics();
        break;
    }
  };

  #handlePopupStateChange = () => {
    this.#moviePresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    this.#renderedFilmCardCount = FILM_CARD_COUNT_PER_STEP;

    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearFilmList();
    this.#renderSort();
    this.#renderFilmList();
  };

  init() {
    this.#renderHeaderProfile();
    this.#renderMenu();
    this.#renderFilmList();
    this.#renderFooterStatistics();
  }
}
