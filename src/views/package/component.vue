<template>
	<h1 v-if="isComponentLoaded">{{ component.componentIdData.componentName }}</h1>
	<tabs>
		<tab-pane active :label="isEditView ? 'Edit component' : 'Create component'">
			
			<h3 v-text="isEditView ? 'Edit component' : 'Create component'"></h3>

			<!-- Loading -->
			<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>

			<!-- Form -->
			<form @submit.prevent="save" v-show="component || !isEditView">

				<!-- Component name -->
				<validator name="validation" v-if="!serviceLoading">
					<template v-if="!isEditView">
						<div class="form-group" 
							:class="{ 'has-error': hasValidationError('name') }">
							<label for="name">Component name</label>
							<input type="text" 
								id="name"
								class="form-control" 
								v-model="model.name" 
								debounce="300"
								v-validate:name="{ required: { rule: true, message: 'The component name is required' } }"
								autofocus />
							<p class="help-block" v-for="msg in validationMessages('name')">{{ msg }}</p>
						</div>
						<div class="form-group">
							<button type="submit" class="btn btn-success">Save</button>
							<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
						</div>
					</template>
				</validator>

				<!-- Description -->
				<div class="panel panel-default panel-default-bordered">
					<div class="panel-heading">
						<h4 class="panel-title">
							<a v-if="isEditView" class="text-link-color pull-right" v-text="isEditable('description') ? 'Cancel' : 'Edit'" href="#" @click.prevent.stop="toggleEditable('description', true)"></a>
							Description <span v-if="component && component.description" class="label label-default">{{ component.description.packageVersionIdData.version }}</span>
						</h4>
					</div>
					<div class="panel-body">

						<!-- Editable -->
						<template v-if="isEditable('description') || !isEditView">
							<div class="form-group">
								<input type="hidden" v-model="model.description" :value="defaultDescription" />
								<markdown-editor 
									:model.sync="model.description"
									:marked-options="appConfig.marked">
								</markdown-editor>
							</div>

							<!-- Editable controls -->
							<div v-if="isEditView" class="form-group">
								<button type="submit" class="btn btn-success">Save</button>
								<button type="button" class="btn btn-link" @click.prevent.stop="toggleEditable('description')">Cancel</button>
							</div>
						</template>
						<!-- // END Editable -->

						<!-- Read-only -->
						<template v-else>
							<template v-if="component && component.description">
								{{{ component.description.data | marked }}}
							</template>
							<p v-else>
								<span class="label label-danger">missing</span>
								The component is missing a description. 
								<a href="#" @click.prevent.stop="toggleEditable('description', true)">Add a description</a>
							</p>
						</template>
						<!-- // END Read-only -->

					</div>
				</div>
				<!-- // END Description -->
					
			</form>
		</tab-pane>
		<tab-pane label="Demos" :visible="isComponentLoaded">
			<component-demos v-if="isComponentLoaded" :component="component"></component-demos>
		</tab-pane>
		<tab-pane label="Properties" :visible="isComponentLoaded" id="properties">
			<component-props v-if="isComponentLoaded" :component="component"></component-props>
		</tab-pane>
	</tabs>
</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import Editable from 'themekit-docs/src/mixins/editable'
	import Validation from 'vue-validator-util'
	import ComponentDemos from 'themekit-docs/src/components/component-demos'
	import ComponentProps from 'themekit-docs/src/components/component-props'
	import { AlertNotification } from 'themekit-vue'
	import { MarkdownEditor } from 'vue-markdown-editor'
	import { Tabs, TabPane } from 'themekit-vue'

	import properCase from 'mout/string/properCase'
	import unhyphenate from 'mout/string/unhyphenate'
	
	export default {
		mixins: [
			Store,
			Validation,
			AlertNotification,
			Editable
		],
		data () {
			return {
				appHelpers: appStore.helpers,
				appConfig: appStore.config,
				appState: appStore.state,
				component: null,
				activeTab: null,
				model: {
					name: null,
					description: null
				}
			}
		},
		computed: {
			packageName () {
				return this.$route.params.packageName
			},
			componentName () {
				return this.$route.params.componentName
			},
			version () {
				return this.$route.params.version
			},
			isEditView () {
				return this.componentName
			},
			isComponentLoaded () {
				return this.component !== null
			},
			name () {
				return this.isEditView ? this.componentName : this.model.name
			},
			description () {
				if (this.isEditable('description') || !this.isEditView) {
					return this.model.description
				}
				return this.defaultDescription
			},
			defaultDescription () {
				if (this.component) {
					return this.component.packageVersionIdData.version === this.version && this.component.description.data ? this.component.description.data : null
				}
			}
		},
		methods: {
			save () {
				this.didSubmit = true
				if (this.$validation.valid) {
					const label = this.model.name ? properCase(unhyphenate(this.model.name)) : this.component.label
					const data = { label }

					this.store.setComponentVersion(this.appState.pkg.packageVersionIdData.objectID, this.name, data, this.description).then(() => {
						this.didSubmit = false
						this.clearEditable()
						this.success('The component was saved.')
					})
				}
			},
			goToPackage () {
				this.$router.go(this.appHelpers.routeToPackageComponents(this.packageName, this.version))
			},
			goToEditComponent () {
				this.$router.go(this.appHelpers.routeToEditComponent(this.packageName, this.name, this.version))
			},
			cancel () {
				this.goToPackage()
			},
			success (message) {
				this.alertNotificationSuccess(message)
				if (!this.isEditView) {
					return this.goToEditComponent()
				}
				this.getComponent()
			},
			getComponent () {
				if (this.isEditView) {
					return this.store.getComponentVersionByName(this.name, this.packageName, this.version).then((data) => this.component = data)
				}
				this.component = null
			}
		},
		created () {
			this.getComponent()
		},
		events: {
			'show.tk.tab': function (tab) {
				this.activeTab = tab
			}
		},
		components: {
			ComponentDemos,
			ComponentProps,
			MarkdownEditor,
			Tabs,
			TabPane
		}
	}
</script>