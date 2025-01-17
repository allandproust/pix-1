import Component from '@glimmer/component';

export default class Disabled extends Component {
  get isCompleted() {
    return ['TO_SHARE', 'SHARED'].includes(this.args.model.status);
  }

  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }
}
