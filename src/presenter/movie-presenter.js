import PopupView from '../view/popup-view';
import FilmCardView from '../view/film-card-view.js';
import { render, remove, replace } from '../framework/render';
import MoviesModel from '../model/movies-model';

export default class MoviePresenter {
  #popupComponent = null;
  #filmCardComponent = null;
  #movieData = null;
  #filmListContainerComponent = null;
  #handleDataChange = null;
  #moviesModel = new MoviesModel();

  constructor({filmListContainerComponent, onDataChange}) {
    this.#filmListContainerComponent = filmListContainerComponent;
    this.#handleDataChange = onDataChange;
  }


  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closePopup();
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({
      ...this.#movieData,
      userDetails: {
        favorite: !this.#movieData.userDetails.favorite,
        watchlist: this.#movieData.userDetails.watchlist,
        alreadyWatched: this.#movieData.userDetails.alreadyWatched
      }});
  };

  #handleWatchlistClick = () => {
    this.#handleDataChange({
      ...this.#movieData,
      userDetails: {
        watchlist: !this.#movieData.userDetails.watchlist,
        favorite: this.#movieData.userDetails.favorite,
        alreadyWatched: this.#movieData.userDetails.alreadyWatched}});
  };

  #handleAlreadyWatchedClick = () => {
    this.#handleDataChange({
      ...this.#movieData,
      userDetails: {
        alreadyWatched: !this.#movieData.userDetails.alreadyWatched,
        watchlist: this.#movieData.userDetails.watchlist,
        favorite: this.#movieData.userDetails.favorite,
      }});
  };

  init(movieData) {
    this.#movieData = movieData;

    const prevPopupComponent = this.#popupComponent;
    const prevFilmCardComponent = this.#filmCardComponent;

    this.#popupComponent = new PopupView({
      movieData: this.#movieData,
      commentsData:this.#moviesModel.getComments(this.#movieData.id),
      onCloseButtonClick: () => {
        this.#closePopup();
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      },
      onFavoriteClick: this.#handleFavoriteClick,
      onWatchlistClick: this.#handleWatchlistClick,
      onAlreadyWatchedClick: this.#handleAlreadyWatchedClick,
    });

    this.#filmCardComponent = new FilmCardView({
      movieData: this.#movieData,
      onFilmCardClick: () => {
        this.#showPopup();
        document.addEventListener('keydown', this.#escKeyDownHandler);
      },
      onFavoriteClick: this.#handleFavoriteClick,
      onWatchlistClick: this.#handleWatchlistClick,
      onAlreadyWatchedClick: this.#handleAlreadyWatchedClick,
    });

    if (prevFilmCardComponent === null || prevPopupComponent === null) {
      render(this.#filmCardComponent, this.#filmListContainerComponent);
      return;
    }

    if (this.#filmListContainerComponent.contains(prevPopupComponent.element)) {
      replace(this.#popupComponent, prevPopupComponent);
    }

    if (this.#filmListContainerComponent.contains(prevFilmCardComponent.element)) {
      replace(this.#filmCardComponent, prevFilmCardComponent);
    }

    remove(prevPopupComponent);
    remove(prevFilmCardComponent);
  }

  destroy() {
    remove(this.#popupComponent);
    remove(this.#filmCardComponent);
  }


  #closePopup() {
    remove(this.#popupComponent);
    document.body.classList.remove('hide-overflow');
  }

  #showPopup() {
    render(this.#popupComponent, document.body);
    document.body.classList.add('hide-overflow');
  }
}
