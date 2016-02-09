<template>

	<div class="page-header">
		<button class="btn btn-primary pull-right" v-link="appHelpers.routeToCreatePackage()">Add package</button>
		<h1>Packages</h1>
	</div>

	<!-- Service Loading -->
	<div class="alert alert-default" v-if="serviceLoading && !packages.length">Loading ...</div>

	<!-- Display list -->
	<isotope v-if="packages.length">
		<isotope-item class="col-md-4" v-for="package in packages">
			<div class="panel panel-default panel-package">
				<div class="panel-heading">
					<h4 class="panel-title">
						<button class="close" @click="removePackageVersion(package)">&times;</button>
						{{ package.packageIdData.packageName }}
					</h4>
				</div>
				<div class="panel-body" v-link="appHelpers.routeToPackageComponents(package.packageIdData.packageName, package.packageVersionIdData.version)">
					<span class="label label-default">{{ package.packageVersionIdData.version }}</span>
					<template v-if="package.description">{{ package.description.data | excerpt }}</template>
				</div>
				<hr>
				<div class="panel-body text-center" v-link="appHelpers.routeToPackageComponents(package.packageIdData.packageName, package.packageVersionIdData.version)">
					<strong>{{ package.components }}</strong> components
				</div>
			</div>
		</isotope-item>
	</isotope>

	<!-- No packages -->
	<div class="alert alert-default" v-if="!serviceLoading && !packages.length">
		No packages to display.
	</div>

</template>

<script>
	import { Isotope, IsotopeItem } from 'vue-isotope'
	import Store from 'themekit-docs/src/mixins/store'
	import Validation from 'vue-validator-util'
	import appStore from 'themekit-docs/src/js/app.store'

	export default {
		mixins: [
			Store,
			Validation
		],
		data () {
			return {
				packages: [],
				appHelpers: appStore.helpers
			}
		},
		methods: {
			onAdded (data) {
				const exists = this.packages.find((p) => p.packageVersionIdData.objectID === data.packageVersionIdData.objectID)
				if (!exists) {
					this.packages.push(data)
				}
			},
			onRemoved (packageVersionId) {
				const pkg = this.packages.find((p) => p.packageVersionIdData.objectID === packageVersionId)
				if (pkg) {
					this.packages.$remove(pkg)
				}
			},
			removePackageVersion (pkg) {
				if (confirm('Are you sure you want to remove this package version?')) {
					this.store.removePackageVersion(pkg.packageVersionIdData.objectID)
				}
			}
		},
		created () {
			this.store.onPackageAdded(this.onAdded)
			this.store.onPackageVersionRemoved(this.onRemoved)
		},
		components: {
			Isotope,
			IsotopeItem
		}
	}
</script>

<style lang="sass">
	.panel-package .panel-body {
		cursor: pointer;
	}
</style>