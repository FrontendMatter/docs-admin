<template>

	<!-- Properties -->
	<div>
		<button type="button" class="btn btn-primary pull-right" data-toggle="modal" data-target="#add-property">Add property</button>
		<h3>Properties</h3>
	</div>

	<!-- Property -->
	<div class="panel panel-body panel-prop panel-default-bordered" v-for="prop in props" id="prop-{{ prop.objectID }}">

		<h3>{{ prop.prop.name }}</h3>
		<label for="prop-{{ prop.objectID }}-description">
			Description
			<span class="label label-default" v-if="prop.description">{{ prop.description.packageVersionIdData.version }}</span>
		</label>

		<!-- Editable property -->
		<form v-if="isEditable(prop.objectID)" @submit.prevent="update">
			<input type="hidden" v-model="componentVersionPropId" :value="prop.objectID" />
			<input type="hidden" v-model="description" v-if="prop.description" :value="prop.description.data" />
			<div class="form-group">
				<textarea id="prop-{{ prop.objectID }}-description"
					class="form-control" 
					v-model="description">
				</textarea>
				<p class="help-block">
					<button type="submit" class="btn btn-default">OK</button>
					<button class="btn btn-default" @click.prevent.stop="toggleEditable(prop.objectID)">Cancel</button>
				</p>
			</div>
		</form>
		<!-- // END Editable property -->

		<!-- Read-only property -->
		<template v-else>
			<a href="#" @click.prevent.stop="toggleEditable(prop.objectID, true)">Edit</a>
			<p class="help-block">
				<template v-if="prop.description">
					{{ prop.description.data }}
				</template>
				<template v-else>
					<span class="label label-danger">missing</span>
					The property is missing a description. 
					<a href="#" @click.prevent.stop="toggleEditable(prop.objectID, true)">Add a description</a>
				</template>
			</p>
		</template>
		<!-- // END Read-only property -->

		<pre v-text="prop.prop | json"></pre>
		<button class="btn btn-link" @click.prevent.stop="remove(prop)">Remove</button>
	
	</div>
	<!-- // END Property -->

	<!-- Loading -->
	<div class="alert alert-default" v-if="!props.length && serviceLoading">Loading data ...</div>

	<!-- No properties -->
	<div v-if="!props.length && !serviceLoading" class="alert alert-default">
		No properties.
	</div>
	
	<!-- Add property modal -->
	<modal id="add-property"
		title="Add property"
		@save.tk.modal="create"
		@show.tk.modal="showModal"
		@hidden.tk.modal="modalOpen=false"
		slide panel>
		<validator name="add-property-validation" slot="body" v-if="modalOpen">
			<form @submit.prevent="submit">
				<div class="form-group" 
					:class="{ 'has-error': hasValidationError('name', 'add-property-validation') }">
					<label for="property-name">Property name</label>
					<input type="text" 
						class="form-control" 
						v-model="name" 
						v-validate:name="{ required: { rule: true, message: 'The property name is required' } }"
						autofocus />
					<p class="help-block" v-for="msg in validationMessages('name', 'add-property-validation')">{{ msg }}</p>
				</div>
				<div class="form-group" 
					:class="{ 'has-error': hasValidationError('description', 'add-property-validation') }">
					<label for="property-description">Description</label>
					<textarea id="property-description"
						class="form-control" 
						v-model="description" 
						v-validate:description="{ required: { rule: true, message: 'The property description is required' } }">
					</textarea>
					<p class="help-block" v-for="msg in validationMessages('description', 'add-property-validation')">{{ msg }}</p>
				</div>
			</form>
		</validator>
	</modal>
	<!-- // END Add property modal -->

</template>

<script>
	import Validation from 'vue-validator-util'
	import Editable from 'themekit-docs/src/mixins/editable'
	import Store from 'themekit-docs/src/mixins/store'
	import { Modal } from 'themekit-vue'
	import slugify from 'mout/string/slugify'

	export default {
		data () {
			return {
				name: null,
				description: null,
				componentVersionPropId: null,
				props: [],
				modal: null,
				modalOpen: false
			}
		},
		mixins: [
			Store,
			Validation,
			Editable
		],
		props: {
			component: {
				type: Object,
				required: true
			}
		},
		methods: {
			create ({ abort, next }) {
				// validate
				this.didSubmit = true
				if (this.getValidator('add-property-validation').invalid) {
					return abort('save')
				}

				const name = slugify(this.name)
				const prop = { name }
				this.store.setComponentVersionProp(this.component.componentVersionIdData.objectID, name, { prop }).then((componentVersionPropId) => {
					this.setDescription(componentVersionPropId, this.description).then(() => componentVersionPropId).then(() => {
						this.onSaveDone(componentVersionPropId)
						this.$nextTick(() => {
							this.$dispatch('scrollTo.tk.scrollable', '#prop-' + componentVersionPropId)
						})
					})
				})

				next('save')
			},
			update () {
				this.clearEditable()
				this.setDescription(this.componentVersionPropId, this.description).then(() => this.onSaveDone(this.componentVersionPropId))
			},
			setDescription (componentVersionPropId, data) {
				if (data && !data.length) {
					data = null
				}
				return this.store.setComponentVersionPropDescription(componentVersionPropId, data).then(() => {
					return this.store.getComponentVersionProp(componentVersionPropId).then((prop) => {
						const exists = this.props.find((p) => p.objectID === prop.objectID)
						const index = this.props.indexOf(exists)
						if (exists) {
							this.props.$set(index, prop)
						}
						else {
							this.props.push(prop)
						}
					})
				})
			},
			onSaveDone (componentVersionPropId) {
				this.didSubmit = false
				this.reset()
			},
			submit () {
				if (this.modal) {
					this.modal.save()
				}
			},
			remove (prop) {
				if (confirm('Are you sure you want to remove this property?')) {
					this.store.removeComponentVersionProp(prop.objectID).then(() => this.props.$remove(prop))
				}
			},
			reset () {
				this.name = null
				this.description = null
				this.componentVersionPropId = null
			},
			showModal () {
				this.clearEditable()
				this.reset()
				this.modalOpen = true
			},
			updateProps () {
				if (this.component && !this.props.length) {
					this.props = this.component.props
				}
			}
		},
		created () {
			this.updateProps()
		},
		events: {
			'ready.tk.modal': function (modal) {
				this.modal = modal
			}
		},
		watch: {
			'component': 'updateProps'
		},
		components: {
			Modal
		}
	}
</script>

<style lang="sass">
	.panel-prop {
		h1, h2, h3  {
			margin: 0 0 15px;
		}
	}
</style>