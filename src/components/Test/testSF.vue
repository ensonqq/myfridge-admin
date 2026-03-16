<template>
  <div>
    <h1>this is test page!!</h1>
  </div>
</template>
<script>
import {mapState} from "vuex";

export default {
  computed : {
    ...mapState(['skuSorting']),
  },
  async created () {
  },
  methods : {},
  async mounted () {
  },
  data : () => ({}),
}

</script>
