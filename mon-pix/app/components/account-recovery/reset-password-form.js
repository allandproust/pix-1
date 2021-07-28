import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';
import isPasswordValid from '../../utils/password-validator';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  emptyPassword: 'pages.account-recovery-after-leaving-sco.reset-password.form.errors.empty-password',
  wrongPasswordFormat: 'pages.account-recovery-after-leaving-sco.reset-password.form.errors.invalid-password',
};

class PasswordValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class ResetPasswordFormComponent extends Component {
  @service store;
  @service intl;

  @tracked passwordValidation = new PasswordValidation();

  @tracked password = '';

  get isFormValid() {
    return !isEmpty(this.password) && this.passwordValidation.status !== 'error';
  }

  @action validatePassword() {
    if (isEmpty(this.password)) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
      return;
    }

    const isInvalidInput = !isPasswordValid(this.password);
    if (isInvalidInput) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongPasswordFormat']);
      return;
    }

    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;
  }

  @action
  async submitResetPasswordForm(event) {
    event.preventDefault();
    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;
    const newPassword = this.store.createRecord('account-recovery-demand', {
      temporaryKey: this.args.temporaryKey,
      password: this.password,
    });
    try {
      await newPassword.update();
    } catch (err) {
      console.log(err);
    }
  }

}