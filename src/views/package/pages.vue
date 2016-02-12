<template>

	<div class="page-header">
		<button class="btn btn-primary pull-right" v-link="appHelpers.routeToCreatePage(packageName, version)">Add page</button>
		<h1>Pages</h1>
	</div>

	<!-- Service Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading ...</div>
	
	<!-- Display list -->
	<isotope v-if="pages.length && !serviceLoading">
		<isotope-item class="col-md-6" v-for="page in pages">
			<div class="panel panel-default panel-page">
				<div class="panel-heading">
					<h4 class="panel-title">
						<button class="close" @click="removePage(page)">&times;</button>
						{{ page.data.title }}
						<span class="label toggle-version" v-if="appState.pkg" :class="{
							'label-default': page.packageVersionId.indexOf(packageVersionId) === -1,
							'label-success': page.packageVersionId.indexOf(packageVersionId) !== -1
						}" @click="togglePackageVersionPage(page)">{{ page.packageVersionIdData.version }}</span>
					</h4>
				</div>
				<div class="panel-body" v-link="appHelpers.routeToEditPage(packageName, version, page.packageVersionPageIdData.pageId)">
					{{ page.data.content | excerpt }}
				</div>
			</div>
		</isotope-item>
	</isotope>
	<!-- // END List -->

	<!-- No results -->
	<div class="alert alert-default" v-if="!serviceLoading && !pages.length">No pages to display.</div>

</template>

<script>
	import { Isotope, IsotopeItem } from 'vue-isotope'
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	
	export default {
		mixins: [
			Store
		],
		data () {
			return {
				pages: [],
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
			},
			packageVersionId () {
				if (this.appState.pkg) {
					return this.appState.pkg.packageVersionIdData.objectID
				}
			}
		},
		methods: {
			removePage (page) {
				if (confirm('Are you sure you want to remove this page?')) {
					const id = page.packageVersionPageIdData.objectID
					this.store.removePackagePage(id).then(() => this.getPages())
				}
			},
			onAdded (page) {
				let exists = this.pages.find((p) => p.packageVersionPageIdData.objectID === page.packageVersionPageIdData.objectID)
				if (!exists) {
					this.pages.push(page)
				}
			},
			onRemoved (packageVersionPageId) {
				this.pages = this.pages.filter((p) => p.packageVersionPageIdData.objectID !== packageVersionPageId)
			},
			getPages () {
				this.store.offPackagePageAdded()
				this.store.onPackagePageAdded(this.packageName, this.version, this.onAdded)
			},
			togglePackageVersionPage (page) {
				this.store.togglePackageVersionPage(this.packageName, this.version, page.packageVersionPageIdData.pageId).then((updatedPage) => {
					if (updatedPage) {
						const index = this.pages.findIndex((p) => p.packageVersionPageIdData.pageId === updatedPage.packageVersionPageIdData.pageId)
						this.pages.$set(index, updatedPage)
					}
				})
			}
		},
		created () {
			this.getPages()
			this.store.onPackageVersionPageRemoved(this.onRemoved)
		},
		destroyed () {
			this.store.offPackageVersionPageRemoved()
		},
		watch: {
			'appState.pkg': 'getPages'
		},
		components: {
			Isotope,
			IsotopeItem
		}
	}
</script>

<style lang="sass">
	.panel-page {
		.panel-body,
		.toggle-version {
			cursor: pointer;
		}
	}
</style>