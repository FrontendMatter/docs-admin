<template>
	<h2>Versions</h2>

	<!-- Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>

	<div class="list-group list-group-media" v-if="versions.length">
		<div class="list-group-item media" v-for="pkg in versions">
			<div class="media-body">
				<a v-link="appHelpers.routeToEditPackage(packageId, pkg.version)">{{ pkg.version }}</a>
			</div>
			<div class="media-right">
				<a href="#" @click.prevent="removePackage(pkg)" class="text-danger"><i class="fa fa-trash"></i></a>
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
				versions: [],
				appHelpers: appStore.helpers
			}
		},
		computed: {
			packageId () {
				return this.$route.params.id
			},
			version () {
				return this.$route.params.version
			}
		},
		methods: {
			matchesCurrentVersion (pkg) {
				let { objectId, version } = pkg
				return this.packageId === objectId && this.version === version
			},
			removePackage (pkg) {
				let { objectId, version } = pkg
				if (confirm('Are you sure you want to remove this version?')) {
					this.store.removePackage(objectId, version).then(() => {
						this.versions.$remove(pkg)
						if (this.matchesCurrentVersion(pkg)) {
							if (this.versions.length) {
								this.$router.go({ 
									name: this.$route.name,
									params: { version: this.versions[0].version }
								})
							}
							else {
								this.$router.go({ name: 'packages', append: false })
							}
						}
					})
				}
			}
		},
		created () {
			if (this.packageId) {
				this.store.getPackageVersions(this.packageId).then((versions) => {
					versions.map((pkg) => {
						const exists = this.versions.find((v) => v.version === pkg.version)
						if (!exists) {
							this.versions.push(pkg)
						}
					})
				})
			}
		}
	}
</script>