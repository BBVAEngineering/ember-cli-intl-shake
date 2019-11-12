import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export const intl = [
	'dummy.javascript'
];

export default Route.extend({
	intl: service(),

	async beforeModel() {
		const translations = await fetch('/translations/dummy/en-us.json');

		this.intl.addTranslations('en-us', await translations.json());

		return this.intl.setLocale(['en-us']);
	}
});
