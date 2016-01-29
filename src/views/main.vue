<template>

	<alert-notification fixed></alert-notification>
	
	<!-- Layout -->
	<layout-transition>

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
						:transform-hit="transformHit"
						search-box-placeholder="Search components ...">
					</algolia-instantsearch-dropdown>
				</div>
				<ul class="nav navbar-nav navbar-right">
					<li><a v-link="'logout'">Logout</a></li>
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

			<!-- Package menu -->
			<template v-if="pkg">
				<div class="sidebar-block bg-white">
					<h4 class="sidebar-category">{{ pkg.name }}</h4>
					<a v-link="appHelpers.routeToEditPackage(packageId)">Edit package</a>
				</div>
				<sidebar-menu :class="sidebarMenuClass" heading="Package navigation">
					<sidebar-collapse-item :model="{ label: 'Components', route: appHelpers.routeToPackageComponents(packageId) }"></sidebar-collapse-item>
					<sidebar-collapse-item :model="{ label: 'Pages', route: appHelpers.routeToPackagePages(packageId) }"></sidebar-collapse-item>
				</sidebar-menu>
			</template>
			<!-- // END Package menu -->

		</sidebar-transition>

		<!-- Content -->
		<div class="container-fluid docs-container">
			<router-view></router-view>
		</div>
		<!-- // END Content -->

	</layout-transition>
	<!-- // END layout -->

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
		replace: false,
		mixins: [
			Store
		],
		data () {
			return {
				packages: [],
				appConfig: appStore.config,
				appHelpers: appStore.helpers,
				user: user,
				pkg: null
			}
		},
		route: {
			canReuse: false
		},
		computed: {
			packageId () {
				return this.$route.params.id
			},
			sidebarMenuClass () {
				return {
					'sm-item-bordered': true,
					'sm-active-button-bg': true,
					'sm-condensed': true
				}
			},
			isPackageView () {
				return this.packageId !== undefined
			}
		},
		created () {
			if (this.packageId) {
				this.store.getPackage(this.packageId).then((pkg) => {
					this.pkg = pkg
				})
			}
		},
		methods: {
			transformHit (hit) {
				hit.route = this.appHelpers.routeToEditComponent(hit.packageId, hit.name)
				return hit
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