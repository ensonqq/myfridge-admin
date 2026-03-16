<template>
  <component :is="tag"
             :type="nativeType"
             @click="handleClick"
             class="btn"
             :disabled="disabled || loading"
             :class="classes">
    <div style="display: flex; justify-content: center; align-items: center">
      <span class="lds-ring" v-if="loading"><div></div><div></div><div></div><div></div></span>
      <span class="btn-label" v-if="$slots.label">
      <slot name="label"></slot>
    </span>

      <slot></slot>
      <span class="btn-label btn-label-right" v-if="$slots.labelRight">
      <slot name="labelRight"></slot>
    </span>
    </div>
  </component>
</template>
<script>
export default {
  name     : 'p-button',
  props    : {
    tag        : {
      type        : String,
      default     : 'button',
      description : 'Html tag to use'
    },
    loading    : {
      type        : Boolean,
      default     : false,
      description : 'loading button'
    },
    disabled   : {
      type        : Boolean,
      default     : false,
      description : 'disabled button'
    },
    type       : {
      type        : String,
      default     : 'default',
      description : 'Color type'
    },
    nativeType : {
      type        : String,
      default     : 'button',
      description : 'Native button type (e.g submit|button) '
    },
    round      : Boolean,
    outline    : Boolean,
    block      : Boolean,
    social     : Boolean,
    link       : Boolean,
    icon       : Boolean,
    wide       : Boolean,
    size       : String
  },
  computed : {
    classes () {
      let btnClasses = [
        { [`btn-outline-${ this.type }`] : this.outline },
        { 'btn-icon' : this.icon },
        { 'btn-round' : this.round },
        { 'btn-block' : this.block },
        { 'btn-social' : this.social },
        { 'btn-link' : this.link },
        { 'btn-wd' : this.wide },
        `btn-${ this.type }`
      ];
      if (this.size) {
        btnClasses.push(`btn-${ this.size }`)
      }
      return btnClasses
    }
  },
  methods  : {
    handleClick (evt) {
      this.$emit('click', evt)
    }
  }
}
</script>
<style lang="scss">
.lds-ring {
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 20px;
  height: 20px;
  border: 4px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
