<template>

	<div class="page-header">
		<button class="btn btn-primary pull-right" v-link="appHelpers.routeToCreateComponent(packageId)">Add component</button>
		<h1>Components</h1>
	</div>

	<!-- Service Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading ...</div>
	
	<!-- Display list -->
	<isotope v-if="components">
		<isotope-item class="col-md-4" v-for="component in components">
			<div class="panel panel-default panel-component">
				<div class="panel-heading">
					<h4 class="panel-title">
						<button class="close" @click="removeComponent(component.objectId)">&times;</button>
						{{ component.name }}
					</h4>
				</div>
				<div class="panel-body" v-link="appHelpers.routeToEditComponent(packageId, component.objectId)">
					<template v-if="component.description">
						{{ component.description }}
					</template>
					<template v-else>
						<span class="label label-danger">missing</span>
					</template>
				</div>
				<ul class="list-group">
					<li class="list-group-item" v-if="component.props">
						<span class="pull-right">
							<i class="fa fa-circle text-red-500" v-if="missing(component.props)" :title="missing(component.props)"></i>
							<i class="fa fa-circle text-orange-500" v-if="outsync(component.objectId, 'props')"></i>
						</span>
						{{ length(component.props) }} properties 
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
	import forOwn from 'mout/object/forOwn'

	export default {
		mixins: [
			Store
		],
		data () {
			return {
				components: [],
				model: [],
				sync: [],
				appHelpers: appStore.helpers
			}
		},
		computed: {
			packageId () {
				return this.$route.params.id
			}
		},
		methods: {
			removeComponent (objectId) {
				if (confirm('Are you sure you want to remove this component?')) {
					this.store.removeComponent(objectId)
				}
			},
			onAdded ({ component, sync, merge }) {
				if (component) {
					let exists = this.model.find((m) => m.objectId === component.objectId)
					if (!exists) {
						this.model.push(component)
					}
				}
				if (sync) {
					let exists = this.sync.find((s) => s.objectId === sync.objectId)
					if (!exists) {
						this.sync.push(sync)
					}
				}
				if (merge) {
					let exists = this.components.find((s) => s.objectId === merge.objectId)
					if (!exists) {
						this.components.push(merge)
					}
				}
			},
			onRemoved (objectId) {
				const models = ['model', 'sync', 'components']
				models.forEach((model) => {
					this[model] = this[model].filter((m) => m.objectId !== objectId)
				})
			},
			length (obj) {
				return obj ? Object.keys(obj).length : 0
			},
			missing (obj) {
				let missing = 0
				forOwn(obj, (value) => {
					if (!value.description) {
						missing++
					}
				})
				return missing
			},
			component (componentId, collection) {
				return this[collection].find((c) => {
					return c.objectId === componentId
				})
			},
			outsync (componentId, prop) {
				let missing = 0
				let component = this.component(componentId, 'model')
				if (!component) {
					return missing
				}
				let syncComponent = this.component(componentId, 'sync')
				forOwn(component[prop], (value, key) => {
					if (syncComponent && typeof syncComponent[prop][key] === 'undefined') {
						missing++
					}
				})
				return missing
			}
		},
		created () {
			this.store.getPackageComponents(this.packageId).then((components) => {
				components.map((component) => this.onAdded(component))
				this.store.onComponentRemoved(this.onRemoved)
			})
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