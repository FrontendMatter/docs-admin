<template>

	<h1 v-if="isEditView && isPackageLoaded">{{ appState.pkg.packageIdData.packageName }}</h1>

	<tabs>
		<tab-pane active :label="isEditView ? 'Edit package' : 'Create package'">

			<h3 v-text="isEditView ? 'Edit package' : 'Create package'"></h3>

			<!-- Loading -->
			<div v-if="serviceLoading" class="alert alert-default">Loading data ...</div>
			
			<form @submit.prevent="save" v-show="!serviceLoading">
				<validator name="validation">
					<template v-if="!isEditView">
						<div class="form-group"
							:class="{ 'has-error': hasValidationError('name') }">
							<label for="name">Package name</label>
							<input type="text" 
								id="name"
								class="form-control" 
								v-model="model.name" 
								v-validate:name="{ required: { rule: true, message: 'The package name is required' } }"
								autofocus />
							<p class="help-block" v-for="msg in validationMessages('name')">{{ msg }}</p>
						</div>
						<div class="form-group">
							<button type="submit" class="btn btn-success">Save</button>
							<button type="button" class="btn btn-link" @click.prevent.stop="cancel">Cancel</button>
						</div>
					</template>
				</validator>

				<!-- Description -->
				<div class="panel panel-default panel-default-bordered">
					<div class="panel-heading">
						<h4 class="panel-title">
							<a v-if="isEditView" class="text-link-color pull-right" v-text="isEditable('description') ? 'Cancel' : 'Edit'" href="#" @click.prevent.stop="toggleEditable('description', true)"></a>
							Description <span v-if="isPackageLoaded && appState.pkg.description" class="label label-default">{{ appState.pkg.description.packageVersionIdData.version }}</span>
						</h4>
					</div>
					<div class="panel-body">

						<!-- Editable -->
						<template v-if="isEditable('description') || !isEditView">
							<div class="form-group">
								<input type="hidden" v-model="model.description" :value="appState.pkg.description.data" />
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
							<input type="hidden" v-model="model.description" :value="defaultDescription" />
							<template v-if="isPackageLoaded && appState.pkg.description">
								{{{ appState.pkg.description.data | marked }}}
							</template>
							<p v-else>
								<span class="label label-danger">missing</span>
								The package is missing a description. 
								<a href="#" @click.prevent.stop="toggleEditable('description', true)">Add a description</a>
							</p>
						</template>
						<!-- // END Read-only -->

					</div>
				</div>
				<!-- // END Description -->

				<!-- README -->
				<div class="panel panel-default panel-default-bordered">
					<div class="panel-heading">
						<h4 class="panel-title">
							<a v-if="isEditView" class="text-link-color pull-right" v-text="isEditable('readme') ? 'Cancel' : 'Edit'" href="#" @click.prevent.stop="toggleEditable('readme', true)"></a>
							README <span v-if="isPackageLoaded && appState.pkg.readme" class="label label-default">{{ appState.pkg.readme.packageVersionIdData.version }}</span>
						</h4>
					</div>
					<div class="panel-body">

						<!-- Editable -->
						<template v-if="isEditable('readme') || !isEditView">
							<div class="form-group">
								<input type="hidden" v-model="model.readme" :value="appState.pkg.readme.data" />
								<markdown-editor 
									:model.sync="model.readme"
									:marked-options="appConfig.marked">
								</markdown-editor>
							</div>

							<!-- Editable controls -->
							<div class="form-group" v-if="isEditView">
								<button type="submit" class="btn btn-success">Save</button>
								<button type="button" class="btn btn-link" @click="toggleEditable('readme')">Cancel</button>
							</div>
						</template>
						<!-- // END Editable -->

						<!-- Read-only -->
						<template v-else>
							<input type="hidden" v-model="model.readme" :value="defaultReadme" />
							<template v-if="isPackageLoaded && appState.pkg.readme">
								{{{ appState.pkg.readme.data | marked }}}
							</template>
							<p v-else>
								<span class="label label-danger">missing</span>
								The package is missing a README. 
								<a href="#" @click.prevent.stop="toggleEditable('readme', true)">Add README</a>
							</p>
						</template>
						<!-- // END Read-only -->

					</div>
				</div>
				<!-- // END README -->
			
			</form>
		</tab-pane>
		<tab-pane :visible="isEditView" id="versions" label="Versions">
			<package-versions v-if="isEditView && activeTab === 'versions'"></package-versions>
		</tab-pane>
	</tabs>
</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import Editable from 'themekit-docs/src/mixins/editable'
	import PackageVersions from 'themekit-docs/src/components/package-versions'
	import Validation from 'vue-validator-util'
	import { AlertNotification } from 'themekit-vue'
	import { MarkdownEditor } from 'vue-markdown-editor'
	import { Tabs, TabPane } from 'themekit-vue'
	
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
				model: {
					name: null,
					description: null,
					readme: null
				},
				activeTab: null
			}
		},
		computed: {
			packageName () {
				return this.$route.params.packageName
			},
			version () {
				return this.$route.params.version || 'latest'
			},
			isEditView () {
				return this.packageName !== undefined
			},
			isPackageLoaded () {
				return this.appState.pkg !== null
			},
			name () {
				return this.isEditView ? this.packageName : this.model.name
			},
			defaultDescription () {
				if (!this.isEditView) {
					return null
				}
				if (this.isPackageLoaded) {
					return this.appState.pkg.packageVersionIdData.version === this.version && this.appState.pkg.description ? this.appState.pkg.description.data : null
				}
			},
			defaultReadme () {
				if (!this.isEditView) {
					return null
				}
				if (this.isPackageLoaded) {
					return this.appState.pkg.packageVersionIdData.version === this.version && this.appState.pkg.readme ? this.appState.pkg.readme.data : null
				}
			}
		},
		methods: {
			save () {
				this.didSubmit = true
				if (this.$validation.valid) {
					this.store.setPackageVersion(this.name, this.version, this.model.description, this.model.readme).then(() => {
						this.didSubmit = false
						this.clearEditable()
						this.success('The package was saved.')
					})
				}
			},
			goToPackages () {
				this.$router.go(this.appHelpers.routeToPackages())
			},
			goToEditPackage () {
				this.$router.go(this.appHelpers.routeToEditPackage(this.name, this.version))
			},
			cancel () {
				this.goToPackages()
			},
			success (message) {
				this.alertNotificationSuccess(message)
				if (!this.isEditView) {
					return this.goToEditPackage()
				}
				this.store.getPackageVersionByName(this.name, this.version).then((pkg) => this.appState.pkg = pkg)
			}
		},
		events: {
			'show.tk.tab': function (tab) {
				this.activeTab = tab
			}
		},
		components: {
			MarkdownEditor,
			PackageVersions,
			Tabs,
			TabPane
		}
	}
</script>
