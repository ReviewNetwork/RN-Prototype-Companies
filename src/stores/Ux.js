import { observable, action } from 'mobx';

export default class User {
  @observable isLoading;
  @observable loadingText;

  constructor() {
    this.isLoading = false;
  }

  @action
  changeLoadingTo(val) {
    this.isLoading = val;
  }

  @action
  changeLoadingText(val) {
    this.loadingText = val;
  }
}
