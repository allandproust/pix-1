import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class AssessmentRoute extends Route.extend(SecuredRouteMixin) {
  async model() {
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    return {
      assessment: await campaignParticipation.assessment,
      campaign,
    };
  }
}
