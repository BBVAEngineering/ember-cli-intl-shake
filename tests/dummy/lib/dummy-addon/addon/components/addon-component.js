import Component from '@glimmer/component';
import { setComponentTemplate } from '@glimmer/manager';
import template from '../templates/components/addon-component';

export const intl = ['dummy-addon.javascript'];

// eslint-disable-next-line
export default class AddonComponent extends Component {}

setComponentTemplate(template, AddonComponent);
