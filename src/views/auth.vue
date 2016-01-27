<template>
	<div class="panel panel-default panel-body" id="auth">
		<auth :firebase="appConfig.storeFirebaseRef"
			:email-view="false"
			google>
		</auth>
	</div>
</template>

<script>
	import 'vue-firebase-auth/dist/vue-firebase-auth.css'
	import { Auth } from 'vue-firebase-auth'
	import appStore from 'themekit-docs/src/js/app.store'
	import { AlertNotification } from 'themekit-vue'

	import user from 'vue-firebase-auth/lib/user'
	user.setRef(appStore.config.storeFirebaseRef)

	export default {
		mixins: [
			AlertNotification
		],
		data () {
			return {
				appConfig: appStore.config
			}
		},
		methods: {
			onLogin () {
				this.alertNotificationSuccess('You are authenticated.')
				setTimeout(() => {
					location.reload()
				}, 1000)
			}
		},
		events: {
			'auth.login': 'onLogin'
		},
		components: {
			Auth
		}
	}
</script>

<style>
	#auth {
		max-width: 400px;
		margin: 0 auto;
	}
</style>