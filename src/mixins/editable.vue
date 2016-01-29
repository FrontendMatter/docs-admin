<script>
	import get from 'mout/object/get'
	import set from 'mout/object/set'

	export default {
		data () {
			return {
				editable: {}
			}
		},
		methods: {
			toggleEditable (key) {
				let editable = {}
				set(editable, key, !this.isEditable(key))
				this.editable = Object.assign({}, this.editable, editable)
			},
			isEditable (key) {
				return get(this.editable, key)
			}
		}
	}
</script>