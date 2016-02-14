webpackJsonp([4],{

/***/ 220:
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },

/***/ 221:
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },

/***/ 234:
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.VueValidatorUtil=t():e.VueValidatorUtil=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(20),u=r(o);t["default"]=u["default"],e.exports=t["default"]},function(e,t){function n(e){return null==e?"":e.toString()}e.exports=n},function(e,t){var n=e.exports={version:"1.2.6"};"number"==typeof __e&&(__e=n)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var o=n(4),u=r(o);Object.defineProperty(t,"__esModule",{value:!0});var i=n(15),a=r(i);t["default"]={data:function(){return{didSubmit:!1}},methods:{getValidator:function(e){return e=e||"validation",e=(0,a["default"])(e),void 0!==this[e]?this[e]:this["$"+e]},getValidatorField:function(e,t){var n=this.getValidator(t);return n?(e=(0,a["default"])(e),n[e]||null):null},hasValidationError:function(e,t){var n=this.getValidatorField(e,t);return n?(n.dirty||this.didSubmit)&&n.invalid:null},validationMessages:function(e,t){var n=this.getValidatorField(e,t);return n?n.messages:null},firstValidationMessage:function(e,t){var n=this.validationMessages(e,t),r=n?(0,u["default"])(n):[];return r.length?n[r[0]]:null}}}},function(e,t,n){e.exports={"default":n(5),__esModule:!0}},function(e,t,n){n(14),e.exports=n(2).Object.keys},function(e,t){e.exports=function(e){if("function"!=typeof e)throw TypeError(e+" is not a function!");return e}},function(e,t,n){var r=n(6);e.exports=function(e,t,n){if(r(e),void 0===t)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,o){return e.call(t,n,r,o)}}return function(){return e.apply(t,arguments)}}},function(e,t){e.exports=function(e){if(void 0==e)throw TypeError("Can't call method on  "+e);return e}},function(e,t,n){var r=n(11),o=n(2),u=n(7),i="prototype",a=function(e,t,n){var c,f,l,s=e&a.F,p=e&a.G,x=e&a.S,d=e&a.P,g=e&a.B,v=e&a.W,F=p?o:o[t]||(o[t]={}),h=p?r:x?r[t]:(r[t]||{})[i];p&&(n=t);for(c in n)f=!s&&h&&c in h,f&&c in F||(l=f?h[c]:n[c],F[c]=p&&"function"!=typeof h[c]?n[c]:g&&f?u(l,r):v&&h[c]==l?function(e){var t=function(t){return this instanceof e?new e(t):e(t)};return t[i]=e[i],t}(l):d&&"function"==typeof l?u(Function.call,l):l,d&&((F[i]||(F[i]={}))[c]=l))};a.F=1,a.G=2,a.S=4,a.P=8,a.B=16,a.W=32,e.exports=a},function(e,t){e.exports=function(e){try{return!!e()}catch(t){return!0}}},function(e,t){var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(e,t,n){var r=n(9),o=n(2),u=n(10);e.exports=function(e,t){var n=(o.Object||{})[e]||Object[e],i={};i[e]=t(n),r(r.S+r.F*u(function(){n(1)}),"Object",i)}},function(e,t,n){var r=n(8);e.exports=function(e){return Object(r(e))}},function(e,t,n){var r=n(13);n(12)("keys",function(e){return function(t){return e(r(t))}})},function(e,t,n){function r(e){return e=o(e),e=u(e),e=i(e).replace(/[\-_]/g," ").replace(/\s[a-z]/g,a).replace(/\s+/g,"").replace(/^[A-Z]/g,c)}var o=n(1),u=n(18),i=n(17),a=n(19),c=n(16);e.exports=r},function(e,t,n){function r(e){return e=o(e),e.toLowerCase()}var o=n(1);e.exports=r},function(e,t,n){function r(e){return e=o(e),e.replace(u,"")}var o=n(1),u=/[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;e.exports=r},function(e,t,n){function r(e){return e=o(e),e.search(/[\xC0-\xFF]/g)>-1&&(e=e.replace(/[\xC0-\xC5]/g,"A").replace(/[\xC6]/g,"AE").replace(/[\xC7]/g,"C").replace(/[\xC8-\xCB]/g,"E").replace(/[\xCC-\xCF]/g,"I").replace(/[\xD0]/g,"D").replace(/[\xD1]/g,"N").replace(/[\xD2-\xD6\xD8]/g,"O").replace(/[\xD9-\xDC]/g,"U").replace(/[\xDD]/g,"Y").replace(/[\xDE]/g,"P").replace(/[\xE0-\xE5]/g,"a").replace(/[\xE6]/g,"ae").replace(/[\xE7]/g,"c").replace(/[\xE8-\xEB]/g,"e").replace(/[\xEC-\xEF]/g,"i").replace(/[\xF1]/g,"n").replace(/[\xF2-\xF6\xF8]/g,"o").replace(/[\xF9-\xFC]/g,"u").replace(/[\xFE]/g,"p").replace(/[\xFD\xFF]/g,"y")),e}var o=n(1);e.exports=r},function(e,t,n){function r(e){return e=o(e),e.toUpperCase()}var o=n(1);e.exports=r},function(e,t,n){var r,o;r=n(3),e.exports=r||{},e.exports.__esModule&&(e.exports=e.exports["default"]),o&&(("function"==typeof e.exports?e.exports.options||{}:e.exports).template=o)}])});

/***/ },

/***/ 236:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(237)
	__vue_template__ = __webpack_require__(252)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "/Code/themekit-docs/themekit-docs-admin/src/views/package/package.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },

/***/ 237:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _app = __webpack_require__(20);

	var _app2 = _interopRequireDefault(_app);

	var _store = __webpack_require__(169);

	var _store2 = _interopRequireDefault(_store);

	var _editable = __webpack_require__(238);

	var _editable2 = _interopRequireDefault(_editable);

	var _packageVersions = __webpack_require__(245);

	var _packageVersions2 = _interopRequireDefault(_packageVersions);

	var _vueValidatorUtil = __webpack_require__(234);

	var _vueValidatorUtil2 = _interopRequireDefault(_vueValidatorUtil);

	var _themekitVue = __webpack_require__(171);

	var _vueMarkdownEditor = __webpack_require__(250);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// <template>
	//
	// 	<h1 v-if="isEditView && isPackageLoaded">{{ appState.pkg.packageIdData.packageName }}</h1>
	//
	// 	<tabs>
	// 		<tab-pane active :label="isEditView ? 'Edit package' : 'Create package'">
	//
	// 			<h3 v-text="isEditView ? 'Edit package' : 'Create package'"></h3>
	//
	// 			<!-- Loading -->
	// 			<div v-if="serviceLoading" class="alert alert-default">Loading data ...</div>
	//
	// 			<form @submit.prevent="save" v-show="!serviceLoading">
	// 				<validator name="validation">
	// 					<template v-if="!isEditView">
	// 						<div class="form-group"
	// 							:class="{ 'has-error': hasValidationError('name') }">
	// 							<label for="name">Package name</label>
	// 							<input type="text"
	// 								id="name"
	// 								class="form-control"
	// 								v-model="model.name"
	// 								v-validate:name="{ required: { rule: true, message: 'The package name is required' } }"
	// 								autofocus />
	// 							<p class="help-block" v-for="msg in validationMessages('name')">{{ msg }}</p>
	// 						</div>
	// 						<div class="form-group">
	// 							<button type="submit" class="btn btn-success">Save</button>
	// 							<button type="button" class="btn btn-link" @click.prevent.stop="cancel">Cancel</button>
	// 						</div>
	// 					</template>
	// 				</validator>
	//
	// 				<!-- Description -->
	// 				<div class="panel panel-default panel-default-bordered">
	// 					<div class="panel-heading">
	// 						<h4 class="panel-title">
	// 							<a v-if="isEditView" class="text-link-color pull-right" v-text="isEditable('description') ? 'Cancel' : 'Edit'" href="#" @click.prevent.stop="toggleEditable('description', true)"></a>
	// 							Description <span v-if="isPackageLoaded && appState.pkg.description" class="label label-default">{{ appState.pkg.description.packageVersionIdData.version }}</span>
	// 						</h4>
	// 					</div>
	// 					<div class="panel-body">
	//
	// 						<!-- Editable -->
	// 						<template v-if="isEditable('description') || !isEditView">
	// 							<div class="form-group">
	// 								<input type="hidden" v-model="model.description" :value="appState.pkg.description.data" />
	// 								<markdown-editor
	// 									:model.sync="model.description"
	// 									:marked-options="appConfig.marked">
	// 								</markdown-editor>
	// 							</div>
	//
	// 							<!-- Editable controls -->
	// 							<div v-if="isEditView" class="form-group">
	// 								<button type="submit" class="btn btn-success">Save</button>
	// 								<button type="button" class="btn btn-link" @click.prevent.stop="toggleEditable('description')">Cancel</button>
	// 							</div>
	// 						</template>
	// 						<!-- // END Editable -->
	//
	// 						<!-- Read-only -->
	// 						<template v-else>
	// 							<input type="hidden" v-model="model.description" :value="defaultDescription" />
	// 							<template v-if="isPackageLoaded && appState.pkg.description">
	// 								{{{ appState.pkg.description.data | marked }}}
	// 							</template>
	// 							<p v-else>
	// 								<span class="label label-danger">missing</span>
	// 								The package is missing a description.
	// 								<a href="#" @click.prevent.stop="toggleEditable('description', true)">Add a description</a>
	// 							</p>
	// 						</template>
	// 						<!-- // END Read-only -->
	//
	// 					</div>
	// 				</div>
	// 				<!-- // END Description -->
	//
	// 				<!-- README -->
	// 				<div class="panel panel-default panel-default-bordered">
	// 					<div class="panel-heading">
	// 						<h4 class="panel-title">
	// 							<a v-if="isEditView" class="text-link-color pull-right" v-text="isEditable('readme') ? 'Cancel' : 'Edit'" href="#" @click.prevent.stop="toggleEditable('readme', true)"></a>
	// 							README <span v-if="isPackageLoaded && appState.pkg.readme" class="label label-default">{{ appState.pkg.readme.packageVersionIdData.version }}</span>
	// 						</h4>
	// 					</div>
	// 					<div class="panel-body">
	//
	// 						<!-- Editable -->
	// 						<template v-if="isEditable('readme') || !isEditView">
	// 							<div class="form-group">
	// 								<input type="hidden" v-model="model.readme" :value="appState.pkg.readme.data" />
	// 								<markdown-editor
	// 									:model.sync="model.readme"
	// 									:marked-options="appConfig.marked">
	// 								</markdown-editor>
	// 							</div>
	//
	// 							<!-- Editable controls -->
	// 							<div class="form-group" v-if="isEditView">
	// 								<button type="submit" class="btn btn-success">Save</button>
	// 								<button type="button" class="btn btn-link" @click="toggleEditable('readme')">Cancel</button>
	// 							</div>
	// 						</template>
	// 						<!-- // END Editable -->
	//
	// 						<!-- Read-only -->
	// 						<template v-else>
	// 							<input type="hidden" v-model="model.readme" :value="defaultReadme" />
	// 							<template v-if="isPackageLoaded && appState.pkg.readme">
	// 								{{{ appState.pkg.readme.data | marked }}}
	// 							</template>
	// 							<p v-else>
	// 								<span class="label label-danger">missing</span>
	// 								The package is missing a README.
	// 								<a href="#" @click.prevent.stop="toggleEditable('readme', true)">Add README</a>
	// 							</p>
	// 						</template>
	// 						<!-- // END Read-only -->
	//
	// 					</div>
	// 				</div>
	// 				<!-- // END README -->
	//
	// 			</form>
	// 		</tab-pane>
	// 		<tab-pane :visible="isEditView" id="versions" label="Versions">
	// 			<package-versions v-if="isEditView && activeTab === 'versions'"></package-versions>
	// 		</tab-pane>
	// 	</tabs>
	// </template>
	//
	// <script>
	exports.default = {
		mixins: [_store2.default, _vueValidatorUtil2.default, _themekitVue.AlertNotification, _editable2.default],
		data: function data() {
			return {
				appHelpers: _app2.default.helpers,
				appConfig: _app2.default.config,
				appState: _app2.default.state,
				model: {
					name: null,
					description: null,
					readme: null
				},
				activeTab: null
			};
		},

		computed: {
			packageName: function packageName() {
				return this.$route.params.packageName;
			},
			version: function version() {
				return this.$route.params.version || 'latest';
			},
			isEditView: function isEditView() {
				return this.packageName !== undefined;
			},
			isPackageLoaded: function isPackageLoaded() {
				return this.appState.pkg !== null;
			},
			name: function name() {
				return this.isEditView ? this.packageName : this.model.name;
			},
			defaultDescription: function defaultDescription() {
				if (!this.isEditView) {
					return null;
				}
				if (this.isPackageLoaded) {
					return this.appState.pkg.packageVersionIdData.version === this.version && this.appState.pkg.description ? this.appState.pkg.description.data : null;
				}
			},
			defaultReadme: function defaultReadme() {
				if (!this.isEditView) {
					return null;
				}
				if (this.isPackageLoaded) {
					return this.appState.pkg.packageVersionIdData.version === this.version && this.appState.pkg.readme ? this.appState.pkg.readme.data : null;
				}
			}
		},
		methods: {
			save: function save() {
				var _this = this;

				this.didSubmit = true;
				if (this.$validation.valid) {
					this.store.setPackageVersion(this.name, this.version, this.model.description, this.model.readme).then(function () {
						_this.didSubmit = false;
						_this.clearEditable();
						_this.success('The package was saved.');
					});
				}
			},
			goToPackages: function goToPackages() {
				this.$router.go(this.appHelpers.routeToPackages());
			},
			goToEditPackage: function goToEditPackage() {
				this.$router.go(this.appHelpers.routeToEditPackage(this.name, this.version));
			},
			cancel: function cancel() {
				this.goToPackages();
			},
			success: function success(message) {
				var _this2 = this;

				this.alertNotificationSuccess(message);
				if (!this.isEditView) {
					return this.goToEditPackage();
				}
				this.store.getPackageVersionByName(this.name, this.version).then(function (pkg) {
					return _this2.appState.pkg = pkg;
				});
			}
		},
		events: {
			'show.tk.tab': function showTkTab(tab) {
				this.activeTab = tab;
			}
		},
		components: {
			MarkdownEditor: _vueMarkdownEditor.MarkdownEditor,
			PackageVersions: _packageVersions2.default,
			Tabs: _themekitVue.Tabs,
			TabPane: _themekitVue.TabPane
		}
	};
	// </script>

/***/ },

/***/ 238:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__vue_script__ = __webpack_require__(239)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "/Code/themekit-docs/themekit-docs-admin/src/mixins/editable.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },

/***/ 239:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(5);

	var _assign2 = _interopRequireDefault(_assign);

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _get = __webpack_require__(240);

	var _get2 = _interopRequireDefault(_get);

	var _set = __webpack_require__(242);

	var _set2 = _interopRequireDefault(_set);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// <script>
	exports.default = {
		data: function data() {
			return {
				editable: {}
			};
		},

		methods: {
			toggleEditable: function toggleEditable(key, unique) {
				var editable = {};
				(0, _set2.default)(editable, key, !this.isEditable(key));
				this.$set('editable', (0, _assign2.default)(unique ? {} : this.editable, editable));
			},
			isEditable: function isEditable(key) {
				return (0, _get2.default)(this.editable, key);
			},
			clearEditable: function clearEditable() {
				this.editable = {};
			}
		}
	};
	// </script>

/***/ },

/***/ 240:
/***/ function(module, exports, __webpack_require__) {

	var isPrimitive = __webpack_require__(241);

	    /**
	     * get "nested" object property
	     */
	    function get(obj, prop){
	        var parts = prop.split('.'),
	            last = parts.pop();

	        while (prop = parts.shift()) {
	            obj = obj[prop];
	            if (obj == null) return;
	        }

	        return obj[last];
	    }

	    module.exports = get;




/***/ },

/***/ 241:
/***/ function(module, exports) {

	

	    /**
	     * Checks if the object is a primitive
	     */
	    function isPrimitive(value) {
	        // Using switch fallthrough because it's simple to read and is
	        // generally fast: http://jsperf.com/testing-value-is-primitive/5
	        switch (typeof value) {
	            case "string":
	            case "number":
	            case "boolean":
	                return true;
	        }

	        return value == null;
	    }

	    module.exports = isPrimitive;




/***/ },

/***/ 242:
/***/ function(module, exports, __webpack_require__) {

	var namespace = __webpack_require__(243);

	    /**
	     * set "nested" object property
	     */
	    function set(obj, prop, val){
	        var parts = (/^(.+)\.(.+)$/).exec(prop);
	        if (parts){
	            namespace(obj, parts[1])[parts[2]] = val;
	        } else {
	            obj[prop] = val;
	        }
	    }

	    module.exports = set;




/***/ },

/***/ 243:
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__(244);

	    /**
	     * Create nested object if non-existent
	     */
	    function namespace(obj, path){
	        if (!path) return obj;
	        forEach(path.split('.'), function(key){
	            if (!obj[key]) {
	                obj[key] = {};
	            }
	            obj = obj[key];
	        });
	        return obj;
	    }

	    module.exports = namespace;




/***/ },

/***/ 244:
/***/ function(module, exports) {

	

	    /**
	     * Array forEach
	     */
	    function forEach(arr, callback, thisObj) {
	        if (arr == null) {
	            return;
	        }
	        var i = -1,
	            len = arr.length;
	        while (++i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
	                break;
	            }
	        }
	    }

	    module.exports = forEach;




/***/ },

/***/ 245:
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(246)
	__vue_script__ = __webpack_require__(248)
	__vue_template__ = __webpack_require__(249)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).template = __vue_template__ }
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), true)
	  if (!hotAPI.compatible) return
	  var id = "/Code/themekit-docs/themekit-docs-admin/src/components/package-versions.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },

/***/ 246:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(247);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(221)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-12e87f59&file=package-versions.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/style-import-loader/index.js?config=sassImportLoader!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./package-versions.vue", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-12e87f59&file=package-versions.vue!./../../node_modules/sass-loader/index.js!./../../node_modules/style-import-loader/index.js?config=sassImportLoader!./../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./package-versions.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 247:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(220)();
	// imports


	// module
	exports.push([module.id, ".list-group-item a.active {\n  font-weight: bold;\n  text-decoration: underline; }\n", ""]);

	// exports


/***/ },

/***/ 248:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _app = __webpack_require__(20);

	var _app2 = _interopRequireDefault(_app);

	var _store = __webpack_require__(169);

	var _store2 = _interopRequireDefault(_store);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// <template>
	// 	<h3>Versions</h3>
	//
	// 	<!-- Loading -->
	// 	<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>
	//
	// 	<div class="list-group list-group-media" v-if="appState.versions.length">
	// 		<div class="list-group-item media" v-for="pkg in appState.versions">
	// 			<div class="media-body">
	// 				<a v-link="appHelpers.routeToEditPackage(packageName, pkg.version)">{{ pkg.version }}</a>
	// 			</div>
	// 			<div class="media-right">
	// 				<a href="#" @click.prevent="removePackageVersion(pkg)" class="text-danger"><i class="fa fa-trash"></i></a>
	// 			</div>
	// 		</div>
	// 	</div>
	// </template>
	//
	// <script>
	exports.default = {
		mixins: [_store2.default],
		data: function data() {
			return {
				appHelpers: _app2.default.helpers,
				appState: _app2.default.state
			};
		},

		computed: {
			packageName: function packageName() {
				return this.$route.params.packageName;
			},
			version: function version() {
				return this.$route.params.version;
			}
		},
		methods: {
			matchesCurrentVersion: function matchesCurrentVersion(pkg) {
				return this.version === pkg.version;
			},
			removePackageVersion: function removePackageVersion(pkg) {
				var _this = this;

				if (confirm('Are you sure you want to remove this version?')) {
					this.store.removePackageVersion(pkg.objectID).then(function () {
						_this.appState.versions.$remove(pkg);
						if (_this.matchesCurrentVersion(pkg)) {
							if (_this.appState.versions.length) {
								_this.$router.go({
									name: _this.$route.name,
									params: { version: _this.appState.versions[0].version }
								});
							} else {
								_this.$router.go({ name: 'packages', append: false });
							}
						}
					});
				}
			}
		}
	};
	// </script>
	//
	// <style lang="sass">
	// 	.list-group-item {
	// 		a.active {
	// 			font-weight: bold;
	// 			text-decoration: underline;
	// 		}
	// 	}
	// </style>

/***/ },

/***/ 249:
/***/ function(module, exports) {

	module.exports = "\n<h3>Versions</h3>\n\n<!-- Loading -->\n<div class=\"alert alert-default\" v-if=\"serviceLoading\">Loading data ...</div>\n\n<div class=\"list-group list-group-media\" v-if=\"appState.versions.length\">\n\t<div class=\"list-group-item media\" v-for=\"pkg in appState.versions\">\n\t\t<div class=\"media-body\">\n\t\t\t<a v-link=\"appHelpers.routeToEditPackage(packageName, pkg.version)\">{{ pkg.version }}</a>\n\t\t</div>\n\t\t<div class=\"media-right\">\n\t\t\t<a href=\"#\" @click.prevent=\"removePackageVersion(pkg)\" class=\"text-danger\"><i class=\"fa fa-trash\"></i></a>\n\t\t</div>\n\t</div>\n</div>\n";

/***/ },

/***/ 250:
/***/ function(module, exports, __webpack_require__) {

	!function(t,e){ true?module.exports=e(__webpack_require__(251)):"function"==typeof define&&define.amd?define(["marked"],e):"object"==typeof exports?exports.VueMarkdownEditor=e(require("marked")):t.VueMarkdownEditor=e(t.marked)}(this,function(t){return function(t){function e(o){if(r[o])return r[o].exports;var i=r[o]={exports:{},id:o,loaded:!1};return t[o].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){"use strict";function o(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var i=r(12),n=o(i),a={MarkdownEditor:n["default"]};a.install=function(t){},"undefined"!=typeof window&&window.Vue&&window.Vue.use(a),e["default"]=a,t.exports=e["default"]},function(t,e){var r=t.exports={version:"1.2.6"};"number"==typeof __e&&(__e=r)},function(t,e){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(t,e,r){"use strict";function o(t){return t&&t.__esModule?t:{"default":t}}var i=r(4),n=o(i);Object.defineProperty(e,"__esModule",{value:!0});var a=r(13),l=o(a);e["default"]={name:"markdown-editor",filters:{marked:l["default"]},props:{model:{},fullscreen:{type:Boolean},validator:{},validate:{type:Object,"default":function(){return{required:{rule:!0,message:"The page content is required"}}}},markedOptions:{}},data:function(){return{scrollInitiator:null}},computed:{editorClass:function(){return{"md-editor-fullscreen":this.isFullscreen}},isFullscreen:function(){return"markdown-editor"===this.$parent.$options.name&&this.fullscreen},initiatorEvents:function(){return["mouseenter","touchstart"]}},methods:{initiators:function(){return[this.preview(),this.textarea()]},textarea:function(){return $(this.$els.textarea).get(0)},preview:function(){return $(this.$els.preview).get(0)},setScrollInitiator:function(t){this.scrollInitiator=t.target},calcScrollFactor:function(t,e){return(t.scrollHeight-t.clientHeight)/(e.scrollHeight-e.clientHeight)},textareaScrollFactor:function(){return this.calcScrollFactor(this.textarea(),this.preview())},previewScrollFactor:function(){return this.calcScrollFactor(this.preview(),this.textarea())},scrollFactorMax:function(){return Math.max.apply(null,[this.textareaScrollFactor(),this.previewScrollFactor()])},scrollFactorMin:function(){return Math.min.apply(null,[this.textareaScrollFactor(),this.previewScrollFactor()])},scrollTopFactor:function(t,e){return(0,n["default"])(e)?Math.round(t*e):t},syncScrollTextarea:function(t){if(this.scrollInitiator===this.preview()){var e=t.target.scrollTop,r=this.textareaScrollFactor()>1,o=r?this.scrollFactorMax():this.scrollFactorMin();this.textarea().scrollTop=this.scrollTopFactor(e,o)}},syncScrollPreview:function(t){if(this.scrollInitiator===this.textarea()){var e=t.target.scrollTop,r=this.previewScrollFactor()>1,o=r?this.scrollFactorMax():this.scrollFactorMin();this.preview().scrollTop=this.scrollTopFactor(e,o)}},updateValidator:function(){this.validator=this.$validation}},created:function(){this.markedOptions&&l["default"].setOptions(this.markedOptions)},ready:function(){var t=this;this.isFullscreen&&(this.initiators().forEach(function(e){t.initiatorEvents.forEach(function(r){e.addEventListener(r,t.setScrollInitiator)})}),$(this.textarea()).on("scroll",this.syncScrollPreview),$(this.preview()).on("scroll",this.syncScrollTextarea))},destroyed:function(){var t=this;this.isFullscreen&&(this.initiators().forEach(function(e){t.initiatorEvents.forEach(function(r){e.removeEventListener(r,t.setScrollInitiator)})}),$(this.textarea()).off("scroll",this.syncScrollPreview),$(this.preview()).off("scroll",this.syncScrollTextarea))}}},function(t,e,r){t.exports={"default":r(5),__esModule:!0}},function(t,e,r){r(9),t.exports=r(1).Number.isFinite},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,r){var o=r(6);t.exports=function(t,e,r){if(o(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,o){return t.call(e,r,o)};case 3:return function(r,o,i){return t.call(e,r,o,i)}}return function(){return t.apply(e,arguments)}}},function(t,e,r){var o=r(2),i=r(1),n=r(7),a="prototype",l=function(t,e,r){var s,c,u,f=t&l.F,d=t&l.G,p=t&l.S,v=t&l.P,h=t&l.B,m=t&l.W,x=d?i:i[e]||(i[e]={}),w=d?o:p?o[e]:(o[e]||{})[a];d&&(r=e);for(s in r)c=!f&&w&&s in w,c&&s in x||(u=c?w[s]:r[s],x[s]=d&&"function"!=typeof w[s]?r[s]:h&&c?n(u,o):m&&w[s]==u?function(t){var e=function(e){return this instanceof t?new t(e):t(e)};return e[a]=t[a],e}(u):v&&"function"==typeof u?n(Function.call,u):u,v&&((x[a]||(x[a]={}))[s]=u))};l.F=1,l.G=2,l.S=4,l.P=8,l.B=16,l.W=32,t.exports=l},function(t,e,r){var o=r(8),i=r(2).isFinite;o(o.S,"Number",{isFinite:function(t){return"number"==typeof t&&i(t)}})},function(t,e){},function(t,e){t.exports='<div class="md-editor row" :class=editorClass><div class="col-md-6 md-editor-wrapper"><validator name=validation><textarea v-el:textarea class=form-control v-model=model debounce=300 placeholder="Write some content ..." :autofocus=isFullscreen field=content v-validate=validate @valid=updateValidator @invalid=updateValidator>\n			</textarea></validator></div><div class="col-md-6 md-preview-wrapper"><button v-if=fullscreen @click.stop="fullscreen=false" type=button class=md-editor-floating-button><i class="fa fa-close"></i></button> <button v-else @click.stop="fullscreen=true" type=button class=md-editor-floating-button><i class="fa fa-arrows-alt"></i></button><div :class="{ scrollable: isFullscreen }" v-el:preview><div class=md-preview v-if=model v-html="model | marked"></div></div></div></div><markdown-editor v-if="fullscreen && !isFullscreen" v-transfer-dom :model.sync=model :fullscreen.sync=fullscreen :validator.sync=validator :validate.sync=validate></markdown-editor>'},function(t,e,r){var o,i;r(10),o=r(3),i=r(11),t.exports=o||{},t.exports.__esModule&&(t.exports=t.exports["default"]),i&&(("function"==typeof t.exports?t.exports.options:t.exports).template=i)},function(e,r){e.exports=t}])});

/***/ },

/***/ 251:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */

	;(function() {

	/**
	 * Block-Level Grammar
	 */

	var block = {
	  newline: /^\n+/,
	  code: /^( {4}[^\n]+\n*)+/,
	  fences: noop,
	  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	  nptable: noop,
	  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	  table: noop,
	  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	  text: /^[^\n]+/
	};

	block.bullet = /(?:[*+-]|\d+\.)/;
	block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();

	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
	  ('def', '\\n+(?=' + block.def.source + ')')
	  ();

	block.blockquote = replace(block.blockquote)
	  ('def', block.def)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();

	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ('def', block.def)
	  ();

	/**
	 * Normal Block Grammar
	 */

	block.normal = merge({}, block);

	/**
	 * GFM Block Grammar
	 */

	block.gfm = merge({}, block.normal, {
	  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
	  paragraph: /^/,
	  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
	});

	block.gfm.paragraph = replace(block.paragraph)
	  ('(?!', '(?!'
	    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
	    + block.list.source.replace('\\1', '\\3') + '|')
	  ();

	/**
	 * GFM + Tables Block Grammar
	 */

	block.tables = merge({}, block.gfm, {
	  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});

	/**
	 * Block Lexer
	 */

	function Lexer(options) {
	  this.tokens = [];
	  this.tokens.links = {};
	  this.options = options || marked.defaults;
	  this.rules = block.normal;

	  if (this.options.gfm) {
	    if (this.options.tables) {
	      this.rules = block.tables;
	    } else {
	      this.rules = block.gfm;
	    }
	  }
	}

	/**
	 * Expose Block Rules
	 */

	Lexer.rules = block;

	/**
	 * Static Lex Method
	 */

	Lexer.lex = function(src, options) {
	  var lexer = new Lexer(options);
	  return lexer.lex(src);
	};

	/**
	 * Preprocessing
	 */

	Lexer.prototype.lex = function(src) {
	  src = src
	    .replace(/\r\n|\r/g, '\n')
	    .replace(/\t/g, '    ')
	    .replace(/\u00a0/g, ' ')
	    .replace(/\u2424/g, '\n');

	  return this.token(src, true);
	};

	/**
	 * Lexing
	 */

	Lexer.prototype.token = function(src, top, bq) {
	  var src = src.replace(/^ +$/gm, '')
	    , next
	    , loose
	    , cap
	    , bull
	    , b
	    , item
	    , space
	    , i
	    , l;

	  while (src) {
	    // newline
	    if (cap = this.rules.newline.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[0].length > 1) {
	        this.tokens.push({
	          type: 'space'
	        });
	      }
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      cap = cap[0].replace(/^ {4}/gm, '');
	      this.tokens.push({
	        type: 'code',
	        text: !this.options.pedantic
	          ? cap.replace(/\n+$/, '')
	          : cap
	      });
	      continue;
	    }

	    // fences (gfm)
	    if (cap = this.rules.fences.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'code',
	        lang: cap[2],
	        text: cap[3] || ''
	      });
	      continue;
	    }

	    // heading
	    if (cap = this.rules.heading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[1].length,
	        text: cap[2]
	      });
	      continue;
	    }

	    // table no leading pipe (gfm)
	    if (top && (cap = this.rules.nptable.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i].split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // lheading
	    if (cap = this.rules.lheading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[2] === '=' ? 1 : 2,
	        text: cap[1]
	      });
	      continue;
	    }

	    // hr
	    if (cap = this.rules.hr.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'hr'
	      });
	      continue;
	    }

	    // blockquote
	    if (cap = this.rules.blockquote.exec(src)) {
	      src = src.substring(cap[0].length);

	      this.tokens.push({
	        type: 'blockquote_start'
	      });

	      cap = cap[0].replace(/^ *> ?/gm, '');

	      // Pass `top` to keep the current
	      // "toplevel" state. This is exactly
	      // how markdown.pl works.
	      this.token(cap, top, true);

	      this.tokens.push({
	        type: 'blockquote_end'
	      });

	      continue;
	    }

	    // list
	    if (cap = this.rules.list.exec(src)) {
	      src = src.substring(cap[0].length);
	      bull = cap[2];

	      this.tokens.push({
	        type: 'list_start',
	        ordered: bull.length > 1
	      });

	      // Get each top-level item.
	      cap = cap[0].match(this.rules.item);

	      next = false;
	      l = cap.length;
	      i = 0;

	      for (; i < l; i++) {
	        item = cap[i];

	        // Remove the list item's bullet
	        // so it is seen as the next token.
	        space = item.length;
	        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

	        // Outdent whatever the
	        // list item contains. Hacky.
	        if (~item.indexOf('\n ')) {
	          space -= item.length;
	          item = !this.options.pedantic
	            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
	            : item.replace(/^ {1,4}/gm, '');
	        }

	        // Determine whether the next list item belongs here.
	        // Backpedal if it does not belong in this list.
	        if (this.options.smartLists && i !== l - 1) {
	          b = block.bullet.exec(cap[i + 1])[0];
	          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	            src = cap.slice(i + 1).join('\n') + src;
	            i = l - 1;
	          }
	        }

	        // Determine whether item is loose or not.
	        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	        // for discount behavior.
	        loose = next || /\n\n(?!\s*$)/.test(item);
	        if (i !== l - 1) {
	          next = item.charAt(item.length - 1) === '\n';
	          if (!loose) loose = next;
	        }

	        this.tokens.push({
	          type: loose
	            ? 'loose_item_start'
	            : 'list_item_start'
	        });

	        // Recurse.
	        this.token(item, false, bq);

	        this.tokens.push({
	          type: 'list_item_end'
	        });
	      }

	      this.tokens.push({
	        type: 'list_end'
	      });

	      continue;
	    }

	    // html
	    if (cap = this.rules.html.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: this.options.sanitize
	          ? 'paragraph'
	          : 'html',
	        pre: !this.options.sanitizer
	          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
	        text: cap[0]
	      });
	      continue;
	    }

	    // def
	    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.links[cap[1].toLowerCase()] = {
	        href: cap[2],
	        title: cap[3]
	      };
	      continue;
	    }

	    // table (gfm)
	    if (top && (cap = this.rules.table.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i]
	          .replace(/^ *\| *| *\| *$/g, '')
	          .split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // top-level paragraph
	    if (top && (cap = this.rules.paragraph.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'paragraph',
	        text: cap[1].charAt(cap[1].length - 1) === '\n'
	          ? cap[1].slice(0, -1)
	          : cap[1]
	      });
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      // Top-level should never reach here.
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'text',
	        text: cap[0]
	      });
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return this.tokens;
	};

	/**
	 * Inline-Level Grammar
	 */

	var inline = {
	  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	  url: noop,
	  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	  link: /^!?\[(inside)\]\(href\)/,
	  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	  br: /^ {2,}\n(?!\s*$)/,
	  del: noop,
	  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	};

	inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

	inline.link = replace(inline.link)
	  ('inside', inline._inside)
	  ('href', inline._href)
	  ();

	inline.reflink = replace(inline.reflink)
	  ('inside', inline._inside)
	  ();

	/**
	 * Normal Inline Grammar
	 */

	inline.normal = merge({}, inline);

	/**
	 * Pedantic Inline Grammar
	 */

	inline.pedantic = merge({}, inline.normal, {
	  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});

	/**
	 * GFM Inline Grammar
	 */

	inline.gfm = merge({}, inline.normal, {
	  escape: replace(inline.escape)('])', '~|])')(),
	  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	  del: /^~~(?=\S)([\s\S]*?\S)~~/,
	  text: replace(inline.text)
	    (']|', '~]|')
	    ('|', '|https?://|')
	    ()
	});

	/**
	 * GFM + Line Breaks Inline Grammar
	 */

	inline.breaks = merge({}, inline.gfm, {
	  br: replace(inline.br)('{2,}', '*')(),
	  text: replace(inline.gfm.text)('{2,}', '*')()
	});

	/**
	 * Inline Lexer & Compiler
	 */

	function InlineLexer(links, options) {
	  this.options = options || marked.defaults;
	  this.links = links;
	  this.rules = inline.normal;
	  this.renderer = this.options.renderer || new Renderer;
	  this.renderer.options = this.options;

	  if (!this.links) {
	    throw new
	      Error('Tokens array requires a `links` property.');
	  }

	  if (this.options.gfm) {
	    if (this.options.breaks) {
	      this.rules = inline.breaks;
	    } else {
	      this.rules = inline.gfm;
	    }
	  } else if (this.options.pedantic) {
	    this.rules = inline.pedantic;
	  }
	}

	/**
	 * Expose Inline Rules
	 */

	InlineLexer.rules = inline;

	/**
	 * Static Lexing/Compiling Method
	 */

	InlineLexer.output = function(src, links, options) {
	  var inline = new InlineLexer(links, options);
	  return inline.output(src);
	};

	/**
	 * Lexing/Compiling
	 */

	InlineLexer.prototype.output = function(src) {
	  var out = ''
	    , link
	    , text
	    , href
	    , cap;

	  while (src) {
	    // escape
	    if (cap = this.rules.escape.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += cap[1];
	      continue;
	    }

	    // autolink
	    if (cap = this.rules.autolink.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[2] === '@') {
	        text = cap[1].charAt(6) === ':'
	          ? this.mangle(cap[1].substring(7))
	          : this.mangle(cap[1]);
	        href = this.mangle('mailto:') + text;
	      } else {
	        text = escape(cap[1]);
	        href = text;
	      }
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // url (gfm)
	    if (!this.inLink && (cap = this.rules.url.exec(src))) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      if (!this.inLink && /^<a /i.test(cap[0])) {
	        this.inLink = true;
	      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	        this.inLink = false;
	      }
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? this.options.sanitizer
	          ? this.options.sanitizer(cap[0])
	          : escape(cap[0])
	        : cap[0]
	      continue;
	    }

	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.inLink = true;
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
	      this.inLink = false;
	      continue;
	    }

	    // reflink, nolink
	    if ((cap = this.rules.reflink.exec(src))
	        || (cap = this.rules.nolink.exec(src))) {
	      src = src.substring(cap[0].length);
	      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	      link = this.links[link.toLowerCase()];
	      if (!link || !link.href) {
	        out += cap[0].charAt(0);
	        src = cap[0].substring(1) + src;
	        continue;
	      }
	      this.inLink = true;
	      out += this.outputLink(cap, link);
	      this.inLink = false;
	      continue;
	    }

	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.strong(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.em(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.codespan(escape(cap[2], true));
	      continue;
	    }

	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.br();
	      continue;
	    }

	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.del(this.output(cap[1]));
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.text(escape(this.smartypants(cap[0])));
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return out;
	};

	/**
	 * Compile Link
	 */

	InlineLexer.prototype.outputLink = function(cap, link) {
	  var href = escape(link.href)
	    , title = link.title ? escape(link.title) : null;

	  return cap[0].charAt(0) !== '!'
	    ? this.renderer.link(href, title, this.output(cap[1]))
	    : this.renderer.image(href, title, escape(cap[1]));
	};

	/**
	 * Smartypants Transformations
	 */

	InlineLexer.prototype.smartypants = function(text) {
	  if (!this.options.smartypants) return text;
	  return text
	    // em-dashes
	    .replace(/---/g, '\u2014')
	    // en-dashes
	    .replace(/--/g, '\u2013')
	    // opening singles
	    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
	    // closing singles & apostrophes
	    .replace(/'/g, '\u2019')
	    // opening doubles
	    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
	    // closing doubles
	    .replace(/"/g, '\u201d')
	    // ellipses
	    .replace(/\.{3}/g, '\u2026');
	};

	/**
	 * Mangle Links
	 */

	InlineLexer.prototype.mangle = function(text) {
	  if (!this.options.mangle) return text;
	  var out = ''
	    , l = text.length
	    , i = 0
	    , ch;

	  for (; i < l; i++) {
	    ch = text.charCodeAt(i);
	    if (Math.random() > 0.5) {
	      ch = 'x' + ch.toString(16);
	    }
	    out += '&#' + ch + ';';
	  }

	  return out;
	};

	/**
	 * Renderer
	 */

	function Renderer(options) {
	  this.options = options || {};
	}

	Renderer.prototype.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }

	  if (!lang) {
	    return '<pre><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }

	  return '<pre><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};

	Renderer.prototype.blockquote = function(quote) {
	  return '<blockquote>\n' + quote + '</blockquote>\n';
	};

	Renderer.prototype.html = function(html) {
	  return html;
	};

	Renderer.prototype.heading = function(text, level, raw) {
	  return '<h'
	    + level
	    + ' id="'
	    + this.options.headerPrefix
	    + raw.toLowerCase().replace(/[^\w]+/g, '-')
	    + '">'
	    + text
	    + '</h'
	    + level
	    + '>\n';
	};

	Renderer.prototype.hr = function() {
	  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	};

	Renderer.prototype.list = function(body, ordered) {
	  var type = ordered ? 'ol' : 'ul';
	  return '<' + type + '>\n' + body + '</' + type + '>\n';
	};

	Renderer.prototype.listitem = function(text) {
	  return '<li>' + text + '</li>\n';
	};

	Renderer.prototype.paragraph = function(text) {
	  return '<p>' + text + '</p>\n';
	};

	Renderer.prototype.table = function(header, body) {
	  return '<table>\n'
	    + '<thead>\n'
	    + header
	    + '</thead>\n'
	    + '<tbody>\n'
	    + body
	    + '</tbody>\n'
	    + '</table>\n';
	};

	Renderer.prototype.tablerow = function(content) {
	  return '<tr>\n' + content + '</tr>\n';
	};

	Renderer.prototype.tablecell = function(content, flags) {
	  var type = flags.header ? 'th' : 'td';
	  var tag = flags.align
	    ? '<' + type + ' style="text-align:' + flags.align + '">'
	    : '<' + type + '>';
	  return tag + content + '</' + type + '>\n';
	};

	// span level renderer
	Renderer.prototype.strong = function(text) {
	  return '<strong>' + text + '</strong>';
	};

	Renderer.prototype.em = function(text) {
	  return '<em>' + text + '</em>';
	};

	Renderer.prototype.codespan = function(text) {
	  return '<code>' + text + '</code>';
	};

	Renderer.prototype.br = function() {
	  return this.options.xhtml ? '<br/>' : '<br>';
	};

	Renderer.prototype.del = function(text) {
	  return '<del>' + text + '</del>';
	};

	Renderer.prototype.link = function(href, title, text) {
	  if (this.options.sanitize) {
	    try {
	      var prot = decodeURIComponent(unescape(href))
	        .replace(/[^\w:]/g, '')
	        .toLowerCase();
	    } catch (e) {
	      return '';
	    }
	    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	      return '';
	    }
	  }
	  var out = '<a href="' + href + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += '>' + text + '</a>';
	  return out;
	};

	Renderer.prototype.image = function(href, title, text) {
	  var out = '<img src="' + href + '" alt="' + text + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += this.options.xhtml ? '/>' : '>';
	  return out;
	};

	Renderer.prototype.text = function(text) {
	  return text;
	};

	/**
	 * Parsing & Compiling
	 */

	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	  this.options.renderer = this.options.renderer || new Renderer;
	  this.renderer = this.options.renderer;
	  this.renderer.options = this.options;
	}

	/**
	 * Static Parse Method
	 */

	Parser.parse = function(src, options, renderer) {
	  var parser = new Parser(options, renderer);
	  return parser.parse(src);
	};

	/**
	 * Parse Loop
	 */

	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options, this.renderer);
	  this.tokens = src.reverse();

	  var out = '';
	  while (this.next()) {
	    out += this.tok();
	  }

	  return out;
	};

	/**
	 * Next Token
	 */

	Parser.prototype.next = function() {
	  return this.token = this.tokens.pop();
	};

	/**
	 * Preview Next Token
	 */

	Parser.prototype.peek = function() {
	  return this.tokens[this.tokens.length - 1] || 0;
	};

	/**
	 * Parse Text Tokens
	 */

	Parser.prototype.parseText = function() {
	  var body = this.token.text;

	  while (this.peek().type === 'text') {
	    body += '\n' + this.next().text;
	  }

	  return this.inline.output(body);
	};

	/**
	 * Parse Current Token
	 */

	Parser.prototype.tok = function() {
	  switch (this.token.type) {
	    case 'space': {
	      return '';
	    }
	    case 'hr': {
	      return this.renderer.hr();
	    }
	    case 'heading': {
	      return this.renderer.heading(
	        this.inline.output(this.token.text),
	        this.token.depth,
	        this.token.text);
	    }
	    case 'code': {
	      return this.renderer.code(this.token.text,
	        this.token.lang,
	        this.token.escaped);
	    }
	    case 'table': {
	      var header = ''
	        , body = ''
	        , i
	        , row
	        , cell
	        , flags
	        , j;

	      // header
	      cell = '';
	      for (i = 0; i < this.token.header.length; i++) {
	        flags = { header: true, align: this.token.align[i] };
	        cell += this.renderer.tablecell(
	          this.inline.output(this.token.header[i]),
	          { header: true, align: this.token.align[i] }
	        );
	      }
	      header += this.renderer.tablerow(cell);

	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];

	        cell = '';
	        for (j = 0; j < row.length; j++) {
	          cell += this.renderer.tablecell(
	            this.inline.output(row[j]),
	            { header: false, align: this.token.align[j] }
	          );
	        }

	        body += this.renderer.tablerow(cell);
	      }
	      return this.renderer.table(header, body);
	    }
	    case 'blockquote_start': {
	      var body = '';

	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }

	      return this.renderer.blockquote(body);
	    }
	    case 'list_start': {
	      var body = ''
	        , ordered = this.token.ordered;

	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }

	      return this.renderer.list(body, ordered);
	    }
	    case 'list_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'loose_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'html': {
	      var html = !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	      return this.renderer.html(html);
	    }
	    case 'paragraph': {
	      return this.renderer.paragraph(this.inline.output(this.token.text));
	    }
	    case 'text': {
	      return this.renderer.paragraph(this.parseText());
	    }
	  }
	};

	/**
	 * Helpers
	 */

	function escape(html, encode) {
	  return html
	    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#39;');
	}

	function unescape(html) {
	  return html.replace(/&([#\w]+);/g, function(_, n) {
	    n = n.toLowerCase();
	    if (n === 'colon') return ':';
	    if (n.charAt(0) === '#') {
	      return n.charAt(1) === 'x'
	        ? String.fromCharCode(parseInt(n.substring(2), 16))
	        : String.fromCharCode(+n.substring(1));
	    }
	    return '';
	  });
	}

	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}

	function noop() {}
	noop.exec = noop;

	function merge(obj) {
	  var i = 1
	    , target
	    , key;

	  for (; i < arguments.length; i++) {
	    target = arguments[i];
	    for (key in target) {
	      if (Object.prototype.hasOwnProperty.call(target, key)) {
	        obj[key] = target[key];
	      }
	    }
	  }

	  return obj;
	}


	/**
	 * Marked
	 */

	function marked(src, opt, callback) {
	  if (callback || typeof opt === 'function') {
	    if (!callback) {
	      callback = opt;
	      opt = null;
	    }

	    opt = merge({}, marked.defaults, opt || {});

	    var highlight = opt.highlight
	      , tokens
	      , pending
	      , i = 0;

	    try {
	      tokens = Lexer.lex(src, opt)
	    } catch (e) {
	      return callback(e);
	    }

	    pending = tokens.length;

	    var done = function(err) {
	      if (err) {
	        opt.highlight = highlight;
	        return callback(err);
	      }

	      var out;

	      try {
	        out = Parser.parse(tokens, opt);
	      } catch (e) {
	        err = e;
	      }

	      opt.highlight = highlight;

	      return err
	        ? callback(err)
	        : callback(null, out);
	    };

	    if (!highlight || highlight.length < 3) {
	      return done();
	    }

	    delete opt.highlight;

	    if (!pending) return done();

	    for (; i < tokens.length; i++) {
	      (function(token) {
	        if (token.type !== 'code') {
	          return --pending || done();
	        }
	        return highlight(token.text, token.lang, function(err, code) {
	          if (err) return done(err);
	          if (code == null || code === token.text) {
	            return --pending || done();
	          }
	          token.text = code;
	          token.escaped = true;
	          --pending || done();
	        });
	      })(tokens[i]);
	    }

	    return;
	  }
	  try {
	    if (opt) opt = merge({}, marked.defaults, opt);
	    return Parser.parse(Lexer.lex(src, opt), opt);
	  } catch (e) {
	    e.message += '\nPlease report this to https://github.com/chjj/marked.';
	    if ((opt || marked.defaults).silent) {
	      return '<p>An error occured:</p><pre>'
	        + escape(e.message + '', true)
	        + '</pre>';
	    }
	    throw e;
	  }
	}

	/**
	 * Options
	 */

	marked.options =
	marked.setOptions = function(opt) {
	  merge(marked.defaults, opt);
	  return marked;
	};

	marked.defaults = {
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  sanitizer: null,
	  mangle: true,
	  smartLists: false,
	  silent: false,
	  highlight: null,
	  langPrefix: 'lang-',
	  smartypants: false,
	  headerPrefix: '',
	  renderer: new Renderer,
	  xhtml: false
	};

	/**
	 * Expose
	 */

	marked.Parser = Parser;
	marked.parser = Parser.parse;

	marked.Renderer = Renderer;

	marked.Lexer = Lexer;
	marked.lexer = Lexer.lex;

	marked.InlineLexer = InlineLexer;
	marked.inlineLexer = InlineLexer.output;

	marked.parse = marked;

	if (true) {
	  module.exports = marked;
	} else if (typeof define === 'function' && define.amd) {
	  define(function() { return marked; });
	} else {
	  this.marked = marked;
	}

	}).call(function() {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },

/***/ 252:
/***/ function(module, exports) {

	module.exports = "\n\n<h1 v-if=\"isEditView && isPackageLoaded\">{{ appState.pkg.packageIdData.packageName }}</h1>\n\n<tabs>\n\t<tab-pane active :label=\"isEditView ? 'Edit package' : 'Create package'\">\n\n\t\t<h3 v-text=\"isEditView ? 'Edit package' : 'Create package'\"></h3>\n\n\t\t<!-- Loading -->\n\t\t<div v-if=\"serviceLoading\" class=\"alert alert-default\">Loading data ...</div>\n\t\t\n\t\t<form @submit.prevent=\"save\" v-show=\"!serviceLoading\">\n\t\t\t<validator name=\"validation\">\n\t\t\t\t<template v-if=\"!isEditView\">\n\t\t\t\t\t<div class=\"form-group\"\n\t\t\t\t\t\t:class=\"{ 'has-error': hasValidationError('name') }\">\n\t\t\t\t\t\t<label for=\"name\">Package name</label>\n\t\t\t\t\t\t<input type=\"text\" \n\t\t\t\t\t\t\tid=\"name\"\n\t\t\t\t\t\t\tclass=\"form-control\" \n\t\t\t\t\t\t\tv-model=\"model.name\" \n\t\t\t\t\t\t\tv-validate:name=\"{ required: { rule: true, message: 'The package name is required' } }\"\n\t\t\t\t\t\t\tautofocus />\n\t\t\t\t\t\t<p class=\"help-block\" v-for=\"msg in validationMessages('name')\">{{ msg }}</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t\t<button type=\"submit\" class=\"btn btn-success\">Save</button>\n\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" @click.prevent.stop=\"cancel\">Cancel</button>\n\t\t\t\t\t</div>\n\t\t\t\t</template>\n\t\t\t</validator>\n\n\t\t\t<!-- Description -->\n\t\t\t<div class=\"panel panel-default panel-default-bordered\">\n\t\t\t\t<div class=\"panel-heading\">\n\t\t\t\t\t<h4 class=\"panel-title\">\n\t\t\t\t\t\t<a v-if=\"isEditView\" class=\"text-link-color pull-right\" v-text=\"isEditable('description') ? 'Cancel' : 'Edit'\" href=\"#\" @click.prevent.stop=\"toggleEditable('description', true)\"></a>\n\t\t\t\t\t\tDescription <span v-if=\"isPackageLoaded && appState.pkg.description\" class=\"label label-default\">{{ appState.pkg.description.packageVersionIdData.version }}</span>\n\t\t\t\t\t</h4>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"panel-body\">\n\n\t\t\t\t\t<!-- Editable -->\n\t\t\t\t\t<template v-if=\"isEditable('description') || !isEditView\">\n\t\t\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t\t\t<input type=\"hidden\" v-model=\"model.description\" :value=\"appState.pkg.description.data\" />\n\t\t\t\t\t\t\t<markdown-editor \n\t\t\t\t\t\t\t\t:model.sync=\"model.description\"\n\t\t\t\t\t\t\t\t:marked-options=\"appConfig.marked\">\n\t\t\t\t\t\t\t</markdown-editor>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<!-- Editable controls -->\n\t\t\t\t\t\t<div v-if=\"isEditView\" class=\"form-group\">\n\t\t\t\t\t\t\t<button type=\"submit\" class=\"btn btn-success\">Save</button>\n\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" @click.prevent.stop=\"toggleEditable('description')\">Cancel</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</template>\n\t\t\t\t\t<!-- // END Editable -->\n\n\t\t\t\t\t<!-- Read-only -->\n\t\t\t\t\t<template v-else>\n\t\t\t\t\t\t<input type=\"hidden\" v-model=\"model.description\" :value=\"defaultDescription\" />\n\t\t\t\t\t\t<template v-if=\"isPackageLoaded && appState.pkg.description\">\n\t\t\t\t\t\t\t{{{ appState.pkg.description.data | marked }}}\n\t\t\t\t\t\t</template>\n\t\t\t\t\t\t<p v-else>\n\t\t\t\t\t\t\t<span class=\"label label-danger\">missing</span>\n\t\t\t\t\t\t\tThe package is missing a description. \n\t\t\t\t\t\t\t<a href=\"#\" @click.prevent.stop=\"toggleEditable('description', true)\">Add a description</a>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</template>\n\t\t\t\t\t<!-- // END Read-only -->\n\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<!-- // END Description -->\n\n\t\t\t<!-- README -->\n\t\t\t<div class=\"panel panel-default panel-default-bordered\">\n\t\t\t\t<div class=\"panel-heading\">\n\t\t\t\t\t<h4 class=\"panel-title\">\n\t\t\t\t\t\t<a v-if=\"isEditView\" class=\"text-link-color pull-right\" v-text=\"isEditable('readme') ? 'Cancel' : 'Edit'\" href=\"#\" @click.prevent.stop=\"toggleEditable('readme', true)\"></a>\n\t\t\t\t\t\tREADME <span v-if=\"isPackageLoaded && appState.pkg.readme\" class=\"label label-default\">{{ appState.pkg.readme.packageVersionIdData.version }}</span>\n\t\t\t\t\t</h4>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"panel-body\">\n\n\t\t\t\t\t<!-- Editable -->\n\t\t\t\t\t<template v-if=\"isEditable('readme') || !isEditView\">\n\t\t\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t\t\t<input type=\"hidden\" v-model=\"model.readme\" :value=\"appState.pkg.readme.data\" />\n\t\t\t\t\t\t\t<markdown-editor \n\t\t\t\t\t\t\t\t:model.sync=\"model.readme\"\n\t\t\t\t\t\t\t\t:marked-options=\"appConfig.marked\">\n\t\t\t\t\t\t\t</markdown-editor>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<!-- Editable controls -->\n\t\t\t\t\t\t<div class=\"form-group\" v-if=\"isEditView\">\n\t\t\t\t\t\t\t<button type=\"submit\" class=\"btn btn-success\">Save</button>\n\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-link\" @click=\"toggleEditable('readme')\">Cancel</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</template>\n\t\t\t\t\t<!-- // END Editable -->\n\n\t\t\t\t\t<!-- Read-only -->\n\t\t\t\t\t<template v-else>\n\t\t\t\t\t\t<input type=\"hidden\" v-model=\"model.readme\" :value=\"defaultReadme\" />\n\t\t\t\t\t\t<template v-if=\"isPackageLoaded && appState.pkg.readme\">\n\t\t\t\t\t\t\t{{{ appState.pkg.readme.data | marked }}}\n\t\t\t\t\t\t</template>\n\t\t\t\t\t\t<p v-else>\n\t\t\t\t\t\t\t<span class=\"label label-danger\">missing</span>\n\t\t\t\t\t\t\tThe package is missing a README. \n\t\t\t\t\t\t\t<a href=\"#\" @click.prevent.stop=\"toggleEditable('readme', true)\">Add README</a>\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</template>\n\t\t\t\t\t<!-- // END Read-only -->\n\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<!-- // END README -->\n\t\t\n\t\t</form>\n\t</tab-pane>\n\t<tab-pane :visible=\"isEditView\" id=\"versions\" label=\"Versions\">\n\t\t<package-versions v-if=\"isEditView && activeTab === 'versions'\"></package-versions>\n\t</tab-pane>\n</tabs>\n";

/***/ }

});
//# sourceMappingURL=4.4.js.map