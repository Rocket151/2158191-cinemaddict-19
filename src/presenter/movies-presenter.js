import ShowMoreButtonView from '../view/button-show-more-view.js';
import SortView from '../view/sort-view.js';
import ContentView from '../view/content-view.js';
import FilmCardView from '../view/film-card-view.js';
import FilmListContainerView from '../view/film-list-container.js';
import FilmListView from '../view/film-list-view.js';
import FooterStatisticsView from '../view/footer-statistics-view.js';
import MenuView from '../view/menu-view.js';
import ProfileRatingView from '../view/profile-rating-view.js';
import {render} from '../render.js';
import PopupContainerView from '../view/popup/popup-container-view.js';
import PopupFilmInfoContainerView from '../view/popup/popup-film-info-container-view.js';
import PopupFilmInfoView from '../view/popup/popup-film-info-view';
import PopupCommentsView from '../view/popup/popup-comments-view.js';
import PopupCommentsContainerView from '../view/popup/popup-comments-container-view.js';
import PopupCommentsListContainerView from '../view/popup/popup-comments-list-container-view.js';
import PopupNewCommentView from '../view/popup/popup-newcomment-view.js';

export default class MoviesPresenter {
  #mainContainer = null;
  #headerProfile = null;
  #footer = null;
  #moviesModel = null;
  #body = null;
  #moviesData = null;

  #filmListComponent = new FilmListView();
  #filmListContainerComponent = new FilmListContainerView();
  #contentComponent = new ContentView();
  #popupContainer = new PopupContainerView();
  #popupFilmInfoContainer = new PopupFilmInfoContainerView();
  #popupCommentsListContainer = new PopupCommentsListContainerView();
  #popupCommentsContainer = null;

  constructor({headerProfile, mainContainer, footer, body, moviesModel}) {
    this.#mainContainer = mainContainer;
    this.#headerProfile = headerProfile;
    this.#footer = footer;
    this.#moviesModel = moviesModel;
    this.#body = body;
  }

  #renderHeaderProfile() {
    render(new ProfileRatingView(), this.#headerProfile);
  }

  #renderMenuAndSort() {
    render(new MenuView(), this.#mainContainer);
    render(new SortView(), this.#mainContainer);
  }

  #renderMainContent() {
    render(this.#contentComponent, this.#mainContainer);
    render(this.#filmListComponent, this.#contentComponent.element());
    render(this.#filmListContainerComponent, this.#filmListComponent.element());

    for (let i = 0; i < this.#moviesData.length; i++) {
      this.#renderFilmCardWithPopup(this.#moviesData[i]);
    }

    render(new ShowMoreButtonView(), this.#filmListContainerComponent.element());
  }


  #renderFooterStatistics() {
    render(new FooterStatisticsView(this.#moviesData.length), this.#footer);
  }

  #renderPopup() {
    render(this.#popupContainer, this.#body);
    render(this.#popupFilmInfoContainer, this.#popupContainer.element());
    render(new PopupFilmInfoView(this.#moviesData[0]), this.#popupFilmInfoContainer.element());
    render(this.#popupCommentsContainer = new PopupCommentsContainerView(this.moviesData[0].comments.length), this.popupContainer.element());
    render(this.#popupCommentsListContainer, this.#popupCommentsContainer.element());
    render(new PopupNewCommentView(), this.popupCommentsContainer.element());
    if(this.moviesData[0].comments.length) {
      for (let i = 0; i < this.moviesData[0].comments.length; i++) {
        render(new PopupCommentsView(this.moviesModel.getComments('0')[i]), this.popupCommentsListContainer.element());
      }
    }
  }

  #renderFilmCardWithPopup(moviesData) {
    const filmCard = new FilmCardView(moviesData);

    render(filmCard, this.#filmListContainerComponent.element());
  }

  init() {
    this.#moviesData = [...this.moviesModel.moviesData()];

    this.#renderHeaderProfile();
    this.#renderMenuAndSort();
    this.#renderMainContent();
    this.#renderFooterStatistics();
    this.#renderPopup();
  }
}
