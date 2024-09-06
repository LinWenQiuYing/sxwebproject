<template>
  <div class="graph-tool">
    <div
      v-for="item in arr"
      :key="item.label"
      @click="item.click"
      :class="[
        'graph-tool-item',
        selected === item.label && item.label === '文字' ? 'active' : '',
      ]"
    >
      <icon-svg :icon-class="item.icon" className="graph-tool-item-img" />
      <span class="graph-tool-item-text">{{ item.label }}</span>
    </div>
  </div>
  <a-modal
    class="graph-fullscreen-modal"
    width="100%"
    :visible="showfullscreen"
    :closable="true"
    :destroyOnClose="true"
    @cancel="onCancel"
    :mask="true"
    :centered="true"
    :title="searchValue"
    :footer="null"
  >
    <div ref="graphDom" class="fullscreen-graph"></div>
    <a-button @click="onRefresh" class="refresh-btn">
      <sync-outlined :spin="loading" /> 刷新
    </a-button>
    <div class="graph-tool">
      <div
        v-for="item in arr"
        :key="item.label"
        @click="item.click"
        :class="[
          'graph-tool-item',
          selected === item.label && item.label === '文字' ? 'active' : '',
        ]"
      >
        <icon-svg :icon-class="item.icon" className="graph-tool-item-img" />
        <span class="graph-tool-item-text">{{ item.label }}</span>
      </div>
    </div>
  </a-modal>
</template>
<script>
import { ref, toRefs, reactive, watch } from "vue";
import { Button, Modal } from "ant-design-vue";
import { find } from "lodash";

export default {
  name: "GraphTool",
  props: {
    searchValue: {
      type: String, //类型字符串
      default: "陕西广电融媒体集团有限公司", //如果没有传递msg参数,默认值是这个
    },
    selectedIndex: {
      type: Number, // 类型数字
      default: 0,
    },
  },
  emits: [
    "handleTextShow",
    "initGraph",
    "handlePlus",
    "handleMinus",
    "handleReset",
    "handleRefresh",
  ],
  components: {
    AButton: Button,
    AModal: Modal,
  },
  setup(props, { emit }) {
    let tools = reactive({
      arr: [],
      selected: "文字",
    });
    let showfullscreen = ref(false); // 全屏弹窗是否显示
    let graphDom = ref(null); // 全屏状态下图谱展示的对应dom
    let loading = ref(null); // 刷新按钮是否旋转

    // 点击文字按钮
    const clickText = () => {
      if (tools.selected === "文字") {
        tools.selected = "";
      } else {
        tools.selected = "文字";
      }
      emit("handleTextShow", tools.selected === "文字");
    };

    // 点击全屏按钮
    const clickFullscreen = () => {
      const target = find(tools.arr, (v) => v.label === "全屏");
      target.label = "退出";
      showfullscreen.value = true;
      setTimeout(() => {
        emit("initGraph", graphDom.value);
      }, 500);
    };

    // 点击放大按钮
    const clickPlus = () => {
      emit("handlePlus");
    };

    // 点击缩小按钮
    const clickMinus = () => {
      emit("handleMinus");
    };

    // 点击重置按钮
    const clickReset = () => {
      emit("handleReset");
    };

    // 关闭全屏
    const onCancel = () => {
      const target = find(tools.arr, (v) => v.label === "退出");
      target.label = "全屏";
      showfullscreen.value = false;
      emit("initGraph", "init");
    };

    const onRefresh = () => {
      emit("handleRefresh");
      loading.value = true;
      setTimeout(() => {
        loading.value = false;
      }, 500);
    };

    watch(
      () => props.selectedIndex,
      (newValue, oldValue) => {
        if (newValue !== 0) {
          tools.arr = [
            {
              label: "全屏",
              icon: "fullscreen",
              click: () => {
                if (showfullscreen.value) {
                  onCancel();
                } else {
                  clickFullscreen();
                }
              },
            },
            {
              label: "放大",
              icon: "plus-circle",
              click: () => {
                clickPlus();
              },
            },
            {
              label: "缩小",
              icon: "minus-circle",
              click: () => {
                clickMinus();
              },
            },
            {
              label: "重置",
              icon: "redo",
              click: () => {
                clickReset();
              },
            },
          ];
          tools.selected = "";
        } else {
          tools.arr = [
            {
              label: "文字",
              icon: "text",
              click: () => {
                clickText();
              },
            },
            {
              label: "全屏",
              icon: "fullscreen",
              click: () => {
                if (showfullscreen.value) {
                  onCancel();
                } else {
                  clickFullscreen();
                }
              },
            },
            {
              label: "放大",
              icon: "plus-circle",
              click: () => {
                clickPlus();
              },
            },
            {
              label: "缩小",
              icon: "minus-circle",
              click: () => {
                clickMinus();
              },
            },
            {
              label: "重置",
              icon: "redo",
              click: () => {
                clickReset();
              },
            },
          ];
          tools.selected = "文字";
        }
      },
      {
        immediate: true,
      }
    );

    return {
      ...toRefs(tools),
      graphDom,
      loading,
      showfullscreen,
      onCancel,
      onRefresh,
    };
  },
};
</script>
<style lang="less">
.graph-tool {
  position: absolute;
  right: 16px;
  bottom: 36px;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 2px 8px rgba(31, 48, 78, 0.16),
    0px 10px 16px 4px rgba(31, 48, 78, 0.08);

  &-item {
    width: 60px;
    height: 66px;
    display: flex;
    cursor: pointer;
    padding-top: 8px;
    user-select: none;
    align-items: center;
    flex-direction: column;

    &.active,
    &:hover {
      background-color: #1776ff;

      .graph-tool-item-img {
        color: #fff;
      }

      .graph-tool-item-text {
        color: #fff;
      }
    }

    &-img {
      width: 28px !important;
      height: 28px !important;
      margin-bottom: 2px;
    }

    &-text {
      font-size: 14px;
      line-height: 20px;
      color: #97a3b7;
    }
  }
}

.graph-fullscreen-modal {
  height: 100%;
  padding: 0;
  max-width: 100%;

  .ant-modal-content {
    height: 100%;

    .ant-modal-header {
      .ant-modal-title {
        font-weight: 600;
      }
    }

    .ant-modal-body {
      position: relative;
      height: calc(100% - 55px);

      .fullscreen-graph {
        height: 100%;
      }
      .refresh-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10;
      }
    }
  }
}
</style>
