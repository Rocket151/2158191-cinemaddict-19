import Observable from '../framework/observable.js';

export default class CommentsModel extends Observable {
  #movieComments = [];
  #commentsApiService = null;

  constructor(commentsApiService) {
    super();
    this.#commentsApiService = commentsApiService;
  }

  get comments() {
    return this.#movieComments;
  }


  async init(movieId) {
    try {
      this.#movieComments = await this.#commentsApiService.getComments(movieId);
      return this.#movieComments;
    } catch(err) {
      this.#movieComments = [];
    }
  }

  #adaptToClient(movie) {
    const adaptedMovie = {...movie,
      filmInfo: {
        title: movie['film_info'].title,
        alternativeTitle: movie['film_info']['alternative_title'],
        totalRating: movie['film_info']['total_rating'],
        poster: movie['film_info'].poster,
        ageRating: movie['film_info']['age_rating'],
        director: movie['film_info'].director,
        writers: movie['film_info'].writers,
        actors: movie['film_info'].actors,
        release: {
          date: movie['film_info'].release.date,
          releaseCountry: movie['film_info'].release['release_country'],
        },
        duration: movie['film_info'].duration,
        genre: movie['film_info'].genre,
        description: movie['film_info'].description,
      },
      userDetails: {
        watchlist: movie['user_details'].watchlist,
        alreadyWatched: movie['user_details'].already_watched,
        watchingDate: movie['user_details'].watching_date,
        favorite: movie['user_details'].favorite,
      }
    };

    delete adaptedMovie['user_details'];
    delete adaptedMovie['film_info'];

    return adaptedMovie;
  }

  async addComment(updateType, update) {
    try {
      const newComment = await this.#commentsApiService.addComment(update);
      this.#movieComments = newComment.comments;

      this._notify(updateType, this.#adaptToClient(newComment.movie));
    } catch(err) {
      throw new Error('Can\'t add comment');
    }
  }
  
  
  
  async deleteComment(updateType, update) {

    try {
      await this.#commentsApiService.deleteComment(update.comment.id);
      this._notify(updateType, update.movie);
    } catch(err) {
      throw new Error('Can\'t delete comment');
    }
  }
}
