import PopupView from '../view/popup-view';
import FilmCardView from '../view/film-card-view.js';
import { render, remove, replace } from '../framework/render';
import { UserAction, UpdateType } from '../const.js';

const PopupState = {
  CLOSED: 'CLOSED',
  OPENED: 'OPENED',
};

let globalPopupState = 'CLOSED'

export default class MoviePresenter {
  #popupComponent = null;
  #filmCardComponent = null;
  #movieData = null;
  #filmListContainerComponent = null;
  #handleDataChange = null;
  #handlePopupStateChange = null;
  #commentsModel = null;

  #popupState = PopupState.CLOSED;
  #scrollPosition = 0;

  constructor({filmListContainerComponent, onDataChange, onPopupStateChange, commentsModel}) {
    this.#filmListContainerComponent = filmListContainerComponent;
    this.#handleDataChange = onDataChange;
    this.#handlePopupStateChange = onPopupStateChange;
    this.#commentsModel = commentsModel;
  }


  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closePopup();
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };

  #handleFavoriteClick = () => {
    this.#scrollPosition = this.#popupComponent.element.scrollTop;
    this.#handleDataChange(
      UserAction.UPDATE_MOVIE,
      globalPopupState !== PopupState.CLOSED ? UpdateType.PATCH : UpdateType.MINOR,
      {
        ...this.#movieData,
        userDetails: {
          favorite: !this.#movieData.userDetails.favorite,
          watchlist: this.#movieData.userDetails.watchlist,
          watchingDate: this.#movieData.userDetails.watchingDate,
          alreadyWatched: this.#movieData.userDetails.alreadyWatched,
        }
      });
  };

  #handleWatchlistClick = () => {
    this.#scrollPosition = this.#popupComponent.element.scrollTop;
    this.#handleDataChange(
      UserAction.UPDATE_MOVIE,
      globalPopupState !== PopupState.CLOSED ? UpdateType.PATCH : UpdateType.MINOR,
       {
        ...this.#movieData,
        userDetails: {
          watchlist: !this.#movieData.userDetails.watchlist,
          favorite: this.#movieData.userDetails.favorite,
          watchingDate: this.#movieData.userDetails.watchingDate,
          alreadyWatched: this.#movieData.userDetails.alreadyWatched
        }
      });
  };

  #handleAlreadyWatchedClick = () => {
    this.#scrollPosition = this.#popupComponent.element.scrollTop;
    this.#handleDataChange(
      UserAction.UPDATE_MOVIE,
      globalPopupState !== PopupState.CLOSED ? UpdateType.PATCH : UpdateType.MINOR,
      {
        ...this.#movieData,
        userDetails: {
          alreadyWatched: !this.#movieData.userDetails.alreadyWatched,
          watchingDate: this.#movieData.userDetails.watchingDate,
          watchlist: this.#movieData.userDetails.watchlist,
          favorite: this.#movieData.userDetails.favorite,
        }
      });
  };

  #handleDeleteClick = (comment) => {
    this.#scrollPosition = this.#popupComponent.element.scrollTop;

    this.#handleDataChange(
      UserAction.DELETE_COMMENT,
      UpdateType.PATCH,
      {comment, movie: {...this.#movieData,
        comments: this.#movieData.comments.filter((commentId) => commentId !== comment.id)
      }}
    );
  };

  #handleFormSubmit = (comment) => {
    this.#scrollPosition = this.#popupComponent.element.scrollTop;

    this.#handleDataChange(
      UserAction.ADD_COMMENT,
      UpdateType.PATCH,
      {comment, movieId: this.#movieData.id},
    );
  };

  init(movieData) {
    this.#movieData = movieData;
    const prevPopupComponent = this.#popupComponent;
    const prevFilmCardComponent = this.#filmCardComponent;

    this.#commentsModel.init(movieData.id).then((commentsData) => {

      this.#popupComponent = new PopupView({
        movieData: this.#movieData,
        commentsData,
        onCloseButtonClick: () => {
          this.#closePopup();
          document.removeEventListener('keydown', this.#escKeyDownHandler);
        },
        onFavoriteClick: this.#handleFavoriteClick,
        onWatchlistClick: this.#handleWatchlistClick,
        onAlreadyWatchedClick: this.#handleAlreadyWatchedClick,
        onDeleteClick: this.#handleDeleteClick,
        onFormSubmit: this.#handleFormSubmit,
      });

      if (prevPopupComponent !== null && document.body.contains(prevPopupComponent.element)) {
        replace(this.#popupComponent, prevPopupComponent);
        this.#popupComponent.element.scrollTo(0, this.#scrollPosition);
        this.#scrollPosition = 0;
      }

      remove(prevPopupComponent);
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

    if (prevFilmCardComponent === null) {
      render(this.#filmCardComponent, this.#filmListContainerComponent);
      return;
    }

    if (this.#filmListContainerComponent.contains(prevFilmCardComponent.element)) {
      replace(this.#filmCardComponent, prevFilmCardComponent);
      remove(prevFilmCardComponent);
    }
  }

  resetView() {
    if (this.#popupState !== PopupState.CLOSED) {
      this.#closePopup();
    }
  }

  destroy() {
    remove(this.#popupComponent);
    remove(this.#filmCardComponent);
  }


  #closePopup() {
    remove(this.#popupComponent);
    document.body.classList.remove('hide-overflow');
    this.popupState = globalPopupState = PopupState.CLOSED;
    this.#popupComponent.resetPopupNewCommentView();
  }

  #showPopup() {
    this.#handlePopupStateChange();
    render(this.#popupComponent, document.body);
    this.#popupState = globalPopupState = PopupState.OPENED;
    document.body.classList.add('hide-overflow');
  }
}
