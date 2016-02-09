<template>

	<div class="page-header">
		<button class="btn btn-primary pull-right" v-link="appHelpers.routeToCreateComponent(packageName, version)">Add component</button>
		<h1>Components</h1>
	</div>

	<!-- Service Loading -->
	<div class="alert alert-default" v-if="serviceLoading && !components.length">Loading ...</div>
	
	<!-- Display list -->
	<isotope v-if="components.length">
		<isotope-item class="col-md-4" v-for="component in components">
			<div class="panel panel-default panel-component">
				<div class="panel-heading">
					<h4 class="panel-title">
						<button class="close" @click="removeComponentVersion(component)">&times;</button>
						{{ component.componentIdData.componentName }}
					</h4>
				</div>
				<div class="panel-body" v-link="appHelpers.routeToEditComponent(packageName, component.componentIdData.componentName, version)">
					<template v-if="component.description.data">
						{{ component.description.data }}
					</template>
					<template v-else>
						<span class="label label-danger">missing</span>
					</template>
				</div>
				<ul class="list-group" v-if="component.props.length">
					<li class="list-group-item">
						<span class="pull-right">
							<i class="fa fa-circle text-red-500" v-if="missing(component.props)" :title="missing(component.props) + ' missing description'"></i>
						</span>
						{{ component.props.length }} properties 
					</li>
				</ul>
			</div>
		</isotope-item>
	</isotope>
	<!-- // END List -->

	<!-- No components -->
	<div class="alert alert-default" v-if="!serviceLoading && !components.length">
		No components to display.
	</div>

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
				components: [],
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
			removeComponentVersion (component) {
				if (confirm('Are you sure you want to remove this component?')) {
					this.store.removeComponentVersion(component.componentVersionIdData.objectID)
				}
			},
			onAdded (data) {
				let exists = this.components.find((c) => c.componentVersionIdData.objectID === data.componentVersionIdData.objectID)
				if (!exists) {
					this.components.push(data)
				}
			},
			onRemoved (componentVersionId) {
				const component = this.components.find((c) => c.componentVersionIdData.objectID === componentVersionId)
				if (component) {
					this.components.$remove(component)
				}
			},
			length (obj) {
				return obj ? Object.keys(obj).length : 0
			},
			missing (props) {
				return props.filter((v) => !v.description).length
			},
			getComponents (newValue, oldValue) {
				if (oldValue) {
					this.store.offPackageVersionComponentAdded(oldValue.packageVersionIdData.objectID)
				}
				if (this.appState.pkg) {
					this.components = []
					this.store.offPackageVersionComponentAdded(this.appState.pkg.packageVersionIdData.objectID)
					this.store.onPackageVersionComponentAdded(this.appState.pkg.packageVersionIdData.objectID, this.onAdded)
				}
			}
		},
		created () {
			this.getComponents()
			this.store.onComponentVersionRemoved(this.onRemoved)
		},
		destroyed () {
			if (this.appState.pkg) {
				this.store.offPackageVersionComponentAdded(this.appState.pkg.packageVersionIdData.objectID)
			}
		},
		watch: {
			'appState.pkg': 'getComponents'
		},
		components: {
			Isotope,
			IsotopeItem
		}
	}
</script>

<style lang="sass">
	.panel-component {
		border-color: $grey-200;
		.panel-body {
			cursor: pointer;
			color: $grey-700;
		}
		.list-group {
			color: $grey-600;
			font-size: 1rem;
			.list-group-item {
				padding: 3px 10px;
				border-color: #f9f9f9;
				.badge {
					top: 2px;
					position: relative;
				}
			}
		}
	}
</style>