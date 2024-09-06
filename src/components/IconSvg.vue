<template>
  <svg
    :class="['svg-icon', svgClass]"
    :style="{ fill: iconColor }"
    aria-hidden="true"
    @click="handleClick"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
import { computed, reactive, toRefs } from "vue";

export default {
  name: "IconSvg",
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    className: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    let icon = reactive({
      iconName: "",
      svgClass: "",
      iconColor: "",
    });

    icon.iconName = computed(() => {
      return `#icon-${props.iconClass}`;
    });
    icon.svgClass = computed(() => {
      return props.className ? props.className : "";
    });
    icon.iconColor = computed(() => {
      if (props.color) {
        return props.color;
      } else {
        return "";
      }
    });

    const handleClick = () => {
      emit("click");
    };

    return {
      ...toRefs(icon),
      handleClick,
    };
  },
};
</script>

<style lang="less" scoped>
.svg-icon {
  width: 100%;
  height: 100%;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;

  &:focus {
    outline: none;
  }
}
</style>
