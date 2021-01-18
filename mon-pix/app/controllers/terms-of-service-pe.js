import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServicePeController extends Controller {
  @service session;
  @service store;
  @service url;

  @tracked isTermsOfServiceValidated = false;
  @tracked showErrorTermsOfServiceNotSelected = false;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async submit() {
    if (this.isTermsOfServiceValidated) {
      this.showErrorTermsOfServiceNotSelected = false;

      await this.session.authenticate('authenticator:oidc', { authenticationKey: 'authenticationKey' });

      if (this.session.attemptedTransition) {
        this.session.attemptedTransition.retry();
      } else {
        this.transitionToRoute('profile');
      }
    } else {
      this.showErrorTermsOfServiceNotSelected = true;
    }
  }

}
