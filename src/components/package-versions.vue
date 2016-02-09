<template>
	<h3>Versions</h3>

	<!-- Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>

	<div class="list-group list-group-media" v-if="appState.versions.length">
		<div class="list-group-item media" v-for="pkg in appState.versions">
			<div class="media-body">
				<a v-link="appHelpers.routeToEditPackage(packageName, pkg.version)">{{ pkg.version }}</a>
			</div>
			<div class="media-right">
				<a href="#" @click.prevent="removePackageVersion(pkg)" class="text-danger"><i class="fa fa-trash"></i></a>
			</div>
		</div>
	</div>
</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'

	export default {
		mixins: [
			Store
		],
		data () {
			return {
				appHelpers: appStore.helpers,
				appState: appStore.state
			}
		},
		computed: {
			packageName () {
				return this.$route.params.packageName
			},
			version () {
				return this.$route.params.version
			}
		},
		methods: {
			matchesCurrentVersion (pkg) {
				return this.version === pkg.version
			},
			removePackageVersion (pkg) {
				if (confirm('Are you sure you want to remove this version?')) {
					this.store.removePackageVersion(pkg.objectID).then(() => {
						this.appState.versions.$remove(pkg)
						if (this.matchesCurrentVersion(pkg)) {
							if (this.appState.versions.length) {
								this.$router.go({ 
									name: this.$route.name,
									params: { version: this.appState.versions[0].version }
								})
							}
							else {
								this.$router.go({ name: 'packages', append: false })
							}
						}
					})
				}
			}
		}
	}
</script>

<style lang="sass">
	.list-group-item {
		a.active { 
			font-weight: bold;
			text-decoration: underline; 
		}
	}
</style>