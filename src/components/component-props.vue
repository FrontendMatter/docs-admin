<template>

	<!-- Properties -->
	<div>
		<button type="button" class="btn btn-primary pull-right" data-toggle="modal" data-target="#add-property">Add property</button>
		<h2>Properties</h2>
	</div>

	<validator name="validation" v-if="hasProps(component)">

		<!-- Property -->
		<template v-for="(key, prop) in model.props">

			<!-- Editable property -->
			<div class="form-group form-group-prop"
				v-if="isEditable(key)" 
				:class="{ 'has-error': hasValidationError('prop-description-' + key) }">
				<h3 id="prop-{{ key }}">{{ prop.name }}</h3>
				<label for="prop-{{ key }}-description">Description</label>
				<textarea id="prop-{{ key }}-description"
					class="form-control" 
					v-model="model.props[ key ].description" 
					:field="'prop-description-' + key"
					v-validate="{ required: { rule: true, message: 'The property description is required' } }">
				</textarea>
				<p class="help-block" v-for="msg in validationMessages('prop-description-' + key)">{{ msg }}</p>
				<p class="help-block">
					<button type="submit" class="btn btn-default">OK</button>
					<button class="btn btn-default" @click.stop="toggleEditable(key)">Cancel</button>
				</p>
				<pre v-text="component.props[ key ] | json"></pre>
				<button class="btn btn-link" @click.prevent.stop="remove(key)">Remove</button>
			</div>
			<!-- // END Editable property -->
			
			<!-- Read-only property -->
			<div v-else class="form-group form-group-prop">
				<h3 id="prop-{{ key }}">{{ prop.name }}</h3>
				<label>Description</label> 
				<a href="#" @click.prevent.stop="toggleEditable(key)">Edit</a>
				<p class="help-block">
					<template v-if="model.props[key].description">
						{{ model.props[key].description }}
					</template>
					<template v-else>
						<span class="label label-danger">missing</span>
						The property is missing a description. 
						<a href="#" @click.prevent.stop="toggleEditable(key)">Add a description</a>
					</template>
				</p>
				<pre v-text="component.props[ key ] | json"></pre>
				<div>
					<button type="submit" class="btn btn-link">Save</button>
					<button class="btn btn-link" @click.prevent.stop="remove(key)">Remove</button>
				</div>
			</div>
			<!-- // END Read-only property -->

		</template>
		<!-- // END Property -->
	</validator>

	<!-- No properties -->
	<div v-else class="alert alert-default">
		No properties.
	</div>
	
	<!-- Add property modal -->
	<modal id="add-property"
		title="Add property"
		@save.tk.modal="create"
		slide panel>
		<validator name="add-property-validation" slot="body">
			<form @submit.prevent="submit">
				<div class="form-group" 
					:class="{ 'has-error': hasValidationError('name', 'add-property-validation') }">
					<label for="property-name">Property name</label>
					<input type="text" 
						class="form-control" 
						v-model="property.name" 
						v-validate:name="{ required: { rule: true, message: 'The property name is required' } }"
						autofocus />
					<p class="help-block" v-for="msg in validationMessages('name', 'add-property-validation')">{{ msg }}</p>
				</div>
				<div class="form-group" 
					:class="{ 'has-error': hasValidationError('description', 'add-property-validation') }">
					<label for="property-description">Description</label>
					<textarea id="property-description"
						class="form-control" 
						v-model="property.description" 
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
	import { Modal } from 'themekit-vue'
	import slugify from 'mout/string/slugify'
	import camelCase from 'mout/string/camelCase'

	export default {
		data () {
			return {
				// add property form
				property: {
					name: null,
					description: null
				},
				modal: null
			}
		},
		mixins: [
			Validation,
			Editable
		],
		props: {
			component: {
				type: Object,
				required: true
			},
			model: {}
		},
		methods: {
			create ({ abort, next }) {

				// validate
				this.didSubmit = true
				if (this.getValidator('add-property-validation').invalid) {
					return abort('save')
				}

				this.save()
				next('save')
			},
			save () {
				// format property model
				this.property.name = slugify(this.property.name)
				let key = camelCase(this.property.name)
				let property = {}
				property[key] = this.property

				// add property
				this.model.props = Object.assign({}, this.model.props, property)
				this.model = Object.assign({}, this.model)

				// reset
				this.didSubmit = false

				// scroll to element
				this.$nextTick(() => {
					this.$dispatch('scrollTo.tk.scrollable', '#prop-' + key)
				})
			},
			submit () {
				if (this.modal) {
					this.modal.save()
				}
			},
			remove (key) {
				if (confirm('Are you sure you want to remove this property?')) {
					delete this.model.props[key]
					this.model = Object.assign({}, this.model)
				}
			},
			hasProps (component) {
				return component.props && Object.keys(component.props).length
			}
		},
		events: {
			'ready.tk.modal': function (modal) {
				this.modal = modal
			}
		},
		components: {
			Modal
		}
	}
</script>