import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  queryParams = {
    selectedFrameworkIds: {
      refreshModel: true,
      type: 'array',
    },
  };

  @service notifications;
  @service store;

  @tracked isSaving = false;

  @tracked targetProfile = this.model.targetProfile;
  @tracked frameworks = this.model.frameworks;
  @tracked selectedFrameworkIds = [];

  get frameworkOptions() {
    return this.frameworks.map((framework) => {
      return { label: framework.name, value: framework.id };
    });
  }

  get orderedAreasBySelectedFrameworks() {
    if (!this.model.areasBySelectedFrameworks) return [];

    const areas = this.model.areasBySelectedFrameworks.reduce((accu, areas) => {
      return [...accu, ...areas.toArray()];
    }, []);
    return areas.sort((area1, area2) => {
      return area1.code - area2.code;
    });
  }

  @action
  goBackToTargetProfileList() {
    this.store.deleteRecord(this.targetProfile);

    this.transitionToRoute('authenticated.target-profiles.list');
  }

  @action
  async createTargetProfile(event) {
    event.preventDefault();

    try {
      this.isSaving = true;
      await this.targetProfile.save();

      this.notifications.success('Le profil cible a été créé avec succès.');
      this.transitionToRoute('authenticated.target-profiles.target-profile', this.targetProfile.id);
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }

    this.isSaving = false;
  }
}
