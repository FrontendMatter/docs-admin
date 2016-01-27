<script>
	import { AlertNotification } from 'themekit-vue'
	import appStore from 'themekit-docs/src/js/app.store'

	import user from 'vue-firebase-auth/lib/user'
	user.setRef(appStore.config.storeFirebaseRef)

	export default {
		mixins: [
			AlertNotification
		],
		compiled () {
			user.logout()
			this.alertNotificationSuccess('You are no longer authenticated.')
			this.$router.go('auth')
		}
	}
</script>