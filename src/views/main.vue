<template>
	
	<layout-transition>
	<!-- Layout -->

		<alert-notification fixed></alert-notification>

		<!-- Navbar -->
		<navbar slot="navbar-content" fixed="top">

			<a v-if="!isPackageView" v-link="appHelpers.routeToPackages()" class="navbar-brand" slot="brand">Manage Docs</a>
			
			<!-- Sidebar Toggle Button -->
			<sidebar-toggle-button v-if="isPackageView"
				slot="sidebar-toggle-button"
				class="toggle pull-left"
				sidebar-id="sidebar"
				icon="fa fa-bars">
			</sidebar-toggle-button>

			<template v-if="user.getAuth()">
				<div class="navbar-form navbar-left">
					<algolia-instantsearch-dropdown
						:algolia-app-id="appConfig.algolia.appId"
						:algolia-api-key="appConfig.algolia.apiKey"
						algolia-index="components"
						:algolia-query-options="algoliaQueryOptions"
						:transform-hit="transformHit"
						placeholder="Search components ...">
					</algolia-instantsearch-dropdown>
				</div>
				<ul class="nav navbar-nav navbar-right">
					<li><a v-link="{ name: 'logout', append: false }">Logout</a></li>
				</ul>
			</template>
		</navbar>
		<!-- // END Navbar -->

		<sidebar-transition 
			:show="isPackageView"
			position="left"
			size="3" 
			slot="sidebar" 
			effect="reveal">

			<a v-link="appHelpers.routeToPackages()" class="sidebar-brand" slot="brand"><i class="fa fa-fw fa-chevron-left"></i> Packages</a>

			<!-- Service Loading -->
			<div class="alert alert-default" v-if="serviceLoading && !pkg">Loading ...</div>

			<template v-if="pkg">
				<!-- Package menu -->
				<div class="sidebar-block bg-white">
					<h4 class="sidebar-category">{{ pkg.packageIdData.packageName }}</h4>
					<p><a v-link="appHelpers.routeToEditPackage(packageName, version)">Edit package</a></p>
					<div class="form-group" v-if="versions.length">
						<label for="version">Version</label>
						<select id="version" class="form-control" v-model="selectedVersion">
							<option v-for="v in versions" value="{{ v.version }}" :selected="v.version === version">{{ v.version }}</option>
						</select>
					</div>
				</div>
				<sidebar-menu :class="sidebarMenuClass" heading="Package navigation">
					<sidebar-collapse-item :model="{ label: 'Components', route: appHelpers.routeToPackageComponents(packageName, version) }"></sidebar-collapse-item>
					<sidebar-collapse-item :model="{ label: 'Pages', route: appHelpers.routeToPackagePages(packageName, version) }"></sidebar-collapse-item>
				</sidebar-menu>
				<!-- // END Package menu -->
			</template>

		</sidebar-transition>

		<!-- Content -->
		<div class="container-fluid docs-container">
			<router-view></router-view>
		</div>
		<!-- // END Content -->

	<!-- // END layout -->
	</layout-transition>

</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import { AlertNotification } from 'themekit-vue'
	import { AlgoliaInstantsearchDropdown } from 'vue-algolia'
	import { LayoutTransition, SidebarTransition } from 'themekit-vue'
	import { SidebarMenu, SidebarCollapseItem } from 'themekit-vue'
	import { Navbar, SidebarToggleButton } from 'themekit-vue'

	import user from 'vue-firebase-auth/lib/user'
	user.setRef(appStore.config.storeFirebaseRef)

	export default {
		mixins: [
			Store
		],
		data () {
			return {
				packages: [],
				appConfig: appStore.config,
				appHelpers: appStore.helpers,
				appState: appStore.state,
				user: user,
				pkg: null,
				versions: [],
				selectedVersion: null
			}
		},
		computed: {
			packageName () {
				return this.$route.params.packageName
			},
			sidebarMenuClass () {
				return {
					'sm-item-bordered': true,
					'sm-active-button-bg': true,
					'sm-condensed': true
				}
			},
			isPackageView () {
				return this.packageName !== undefined
			},
			version () {
				return this.$route.params.version
			},
			algoliaQueryOptions () {
				let options = {
					hitsPerPage: 5,
					distinct: true
				}
				if (this.isPackageView) {
					options = Object.assign({}, options, {
						facets: '*',
						facetFilters: [
							`packageId: ${ this.packageId }`,
							`version: ${ this.version }`
						]
					})
				}
				return options
			}
		},
		created () {
			this.getPackage()
		},
		methods: {
			transformHit (hit) {
				hit.route = this.appHelpers.routeToEditComponent(hit.packageName, hit.name, hit.version)
				return hit
			},
			getPackageVersions () {
				if (this.packageName) {
					this.store.getPackageVersions(this.pkg.packageIdData.objectID).then((versions) => this.versions = versions)
				}
			},
			getPackage () {
				if (this.packageName) {
					return this.store.getPackageVersionByName(this.packageName, this.version).then((pkg) => this.pkg = pkg)
				}
				this.pkg = null
			},
			updatePackage (value) {
				this.appState.pkg = value
				if (value) {
					this.getPackageVersions()
				}
			},
			updateVersion () {
				this.selectedVersion = this.version
				this.getPackage()
			},
			routeVersion () {
				if (this.selectedVersion && this.version !== this.selectedVersion) {
					this.$router.go({ name: this.$route.name, params: { version: this.selectedVersion } })
				}
			}
		},
		watch: {
			packageName: 'getPackage',
			version: 'updateVersion',
			selectedVersion: 'routeVersion',
			pkg: 'updatePackage',
			versions (value) {
				this.appState.versions = value
			}
		},
		components: {
			LayoutTransition,
			SidebarTransition,
			SidebarMenu,
			SidebarCollapseItem,
			Navbar,
			SidebarToggleButton,
			AlgoliaInstantsearchDropdown,
			AlertNotification
		}
	}
</script>