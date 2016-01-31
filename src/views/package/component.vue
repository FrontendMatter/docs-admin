<template>

	<!-- Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>
	
	<!-- Main form -->
	<validator name="validation">
		<form @submit.prevent="create" v-show="!serviceLoading">

			<div class="page-header">
				<div class="pull-right">
					<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
					<button type="submit" class="btn btn-success">Save</button>
				</div>
				<h1 v-text="isEditView ? 'Edit component' : 'Create component'"></h1>
			</div>

			<!-- Component name -->
			<div class="form-group" 
				:class="{ 'has-error': hasValidationError('name') }">
				<label for="name">Component name</label>
				<input type="text" 
					id="name"
					class="form-control" 
					v-model="model.name" 
					debounce="300"
					v-validate:name="{ required: { rule: true, message: 'The component name is required' } }"
					:autofocus="!isEditView"  />
				<p class="help-block" v-for="msg in validationMessages('name')">{{ msg }}</p>
			</div>

			<!-- Component description -->
			<div class="form-group" 
				:class="{ 'has-error': hasValidationError('content', 'descriptionValidator') }">
				<label for="description">Description</label>

				<markdown-editor
					:model.sync="model.description"
					:validator.sync="descriptionValidator"
					:validate="{ required: { rule: true, message: 'The component description is required.' } }"
					:marked-options="appConfig.marked">
				</markdown-editor>

				<p class="help-block" v-for="msg in validationMessages('content', 'descriptionValidator')">{{ msg }}</p>
			</div>

			<!-- Demos -->
			<component-demos v-if="componentId"></component-demos>

			<!-- Props -->
			<component-props :component="component" :model.sync="model"></component-props>
			
			<!-- Main form controls -->
			<div class="form-group">
				<button type="submit" class="btn btn-success">Save</button>
				<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
			</div>
		</form>
	</validator>
	<!-- // END Main form -->

</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import Validation from 'vue-validator-util'
	import ComponentDemos from 'themekit-docs/src/components/component-demos'
	import ComponentProps from 'themekit-docs/src/components/component-props'
	import { AlertNotification } from 'themekit-vue'
	import { MarkdownEditor } from 'vue-markdown-editor'

	import merge from 'mout/object/merge'
	import forOwn from 'mout/object/forOwn'
	import properCase from 'mout/string/properCase'
	import unhyphenate from 'mout/string/unhyphenate'
	
	export default {
		mixins: [
			Store,
			Validation,
			AlertNotification
		],
		data () {
			return {
				appHelpers: appStore.helpers,
				appConfig: appStore.config,

				// main form model
				model: {
					name: null,
					label: null,
					packageId: null,
					version: null,
					description: null,
					props: {}
				},

				// sync model
				sync: null,

				// vue-markdown-editor validator
				descriptionValidator: null
			}
		},
		route: {
			canReuse: false
		},
		computed: {
			component () {
				return this.sync ? merge({}, this.sync, this.model) : this.model
			},
			packageId () {
				return this.$route.params.id
			},
			componentId () {
				return this.$route.params.componentId
			},
			version () {
				return this.$route.params.version
			},
			isEditView () {
				return this.componentId
			},
			valid () {
				return this.$validation.valid && this.descriptionValidator.valid
			}
		},
		methods: {
			create () {
				this.didSubmit = true
				if (this.valid) {
					this.model.label = properCase(unhyphenate(this.model.name))
					this.store.setComponent(this.componentId, this.saveFormatter(), this.version).then((objectId) => {
						if (!this.model.objectId) {
							this.model.objectId = objectId
						}
						this.didSubmit = false
						this.success('The component was saved.')
					})
				}
			},
			goToPackage () {
				this.$router.go(this.appHelpers.routeToPackageComponents(this.packageId, this.version))
			},
			goToEditComponent () {
				this.$router.go(this.appHelpers.routeToEditComponent(this.packageId, this.model.objectId, this.version))
			},
			cancel () {
				this.goToPackage()
			},
			success (message) {
				this.alertNotificationSuccess(message)
				if (!this.isEditView) {
					this.goToEditComponent()
				}
			},
			modelSyncFormatter (sync) {
				let model = this.model
				forOwn(sync.props, (prop, key) => {
					model.props[key] = {
						name: prop.name,
						description: null
					}
				})
				return model
			},
			saveFormatter () {
				let model = JSON.parse(JSON.stringify(this.model))
				forOwn(model.props, (prop, key) => {
					if (!prop.description || prop.description.length === 0) {
						delete model.props[key]
					}
				})
				return model
			}
		},
		created () {
			this.store.on('serviceLoading', () => {
				$('button[type="submit"]').prop('disabled', true)
			})

			this.store.on('serviceComplete', () => {
				setTimeout(() => {
					$('button[type="submit"]').prop('disabled', false)
				}, 200)
			})

			const mergeModel = {
				packageId: this.packageId,
				version: this.version
			}

			if (this.isEditView) {
				this.store.getComponent(this.componentId, this.version).then(({ component, sync }) => {
					if (component && sync) {
						this.model = merge(this.modelSyncFormatter(sync), component)
					}
					else if (sync && !component) {
						this.model = merge(this.modelSyncFormatter(sync), { name: sync.name })
					}
					else if (!sync && component) {
						this.model = component
					}
					if (sync) {
						this.sync = sync
					}
					this.model = merge(this.model, mergeModel)
				})
			}
			else {
				this.model = merge(this.model, mergeModel)
			}
		},
		components: {
			ComponentDemos,
			ComponentProps,
			MarkdownEditor
		}
	}
</script>

<style lang="sass">
	.form-group-prop {
		border: 1px solid $panel-default-border;
		padding: 15px;
		border-radius: $panel-border-radius;
		h1, h2, h3  {
			margin: 0 0 15px;
		}
	}
</style>