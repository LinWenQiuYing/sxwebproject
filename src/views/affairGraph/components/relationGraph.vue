<template>
  <graphTool
    :searchValue="name"
    :selectedIndex="0"
    v-if="id"
    @initGraph="initGraph"
    @handlePlus="handlePlus"
    @handleMinus="handleMinus"
    @handleReset="handleReset"
    @handleRefresh="handleRefresh"
    @handleTextShow="handleTextShow"
  />
  <a-spin v-if="loading" size="large" tip="正在加载..." class="main-spin" />
  <div class="relation-graph" ref="graphDom"></div>
</template>
<script>
import G6 from "@antv/g6";
import { ref, reactive, watchEffect, watch } from "vue";
import { message, Spin } from "ant-design-vue";
import { getRelationGraph } from "@/shared/api/affairGraph";
import useTooltip, { getNodeDetail } from "../hooks/tooltip";
import graphTool from "./graphTool";
import {
  refreshGraph,
  plusGraph,
  minusGraph,
  resetGraph,
} from "../hooks/graphActions";
import { useStore } from "vuex";

export default {
  name: "RelationGraph",
  components: {
    ASpin: Spin,
    graphTool,
  },
  setup() {
    const graphDom = ref(null);
    const store = useStore(); // 路由对象
    const id = ref(store.state.enterpriseId);
    const name = ref(store.state.enterpriseName);
    const loading = ref(true);
    const graphData = reactive({
      nodes: [
        {
          id: "0",
          name: "海南巧易科技有限公司海南巧易科技有限公司",
          type: "target-node",
          size: 72,
        },
        {
          id: "1",
          name: "徐文",
          type: "person-node",
        },
        {
          id: "2",
          name: "上海巧致企业管理有限公司司",
          type: "enterprise-node",
        },
        {
          id: "4",
          name: "上海星环科技股份有限公司公司",
          type: "enterprise-node",
        },
        {
          id: "5",
          name: "南京星环科技有限公司公司",
          type: "enterprise-node",
        },
      ],
      edges: [
        {
          source: "0",
          target: "1",
          label: "股东",
          style: {
            stroke: "#FD6871",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#FD6871",
            },
          },
          labelCfg: {
            style: {
              fill: "#FD6871",
            },
          },
        },
        {
          source: "0",
          target: "2",
          label: "交易",
          style: {
            stroke: "#FD6871",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#FD6871",
            },
          },
          labelCfg: {
            style: {
              fill: "#FD6871",
            },
          },
        },
        {
          source: "1",
          target: "2",
          label: "投资",
          style: {
            stroke: "#69B1FF",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#69B1FF",
            },
          },
          labelCfg: {
            style: {
              fill: "#69B1FF",
            },
          },
        },
        {
          source: "4",
          target: "1",
          label: "担保",
          style: {
            stroke: "#69B1FF",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#69B1FF",
            },
          },
          labelCfg: {
            style: {
              fill: "#69B1FF",
            },
          },
        },
        {
          id: "test1",
          source: "4",
          target: "5",
          label: "担保",
          style: {
            stroke: "#69B1FF",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#69B1FF",
            },
          },
          labelCfg: {
            style: {
              fill: "#69B1FF",
            },
          },
        },
        {
          id: "test2",
          source: "4",
          target: "5",
          label: "担保",
          style: {
            stroke: "#69B1FF",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#69B1FF",
            },
          },
          labelCfg: {
            style: {
              fill: "#69B1FF",
            },
          },
        },
      ],
    });
    const blueColorLabels = reactive(["投资"]);
    let graph = null;
    let canvasRatio = ref(1); // 图谱放大缩小比例

    // 画布点击事件
    const canvasClick = () => {
      const eles = [...graph.getNodes(), ...graph.getEdges()];
      eles.map((ele) => {
        graph.clearItemStates(ele, ["click", "gray"]);
      });
    };

    // 置灰所有点边
    const grayEles = (eles) => {
      eles.map((ele) => {
        graph.setItemState(ele, "gray", true);
      });
    };

    // 高亮当前节点的一度关系点边
    const highlightEles = (eles) => {
      eles.map((ele) => {
        graph.setItemState(ele, "gray", false);
      });
    };

    // 文本换行省略方法
    const handleText = (text) => {
      const wrapNum1 = 4; // 第一行换行长度，超过则换行
      const wrapNum2 = 5; // 第二行换行长度，超过则换行
      const wrapNum3 = 3; // 第三行省略长度，超过则省略，是省略
      let content = ""; // 处理后的最终文本内容
      if (text.length > wrapNum1 + wrapNum2 + wrapNum3) {
        // 换两行且需要加省略号
        content =
          text.slice(0, wrapNum1) +
          "\n" +
          text.slice(wrapNum1, wrapNum1 + wrapNum2) +
          "\n" +
          text.slice(wrapNum1 + wrapNum2, wrapNum1 + wrapNum2 + wrapNum3) +
          "...";
      } else if (text.length > wrapNum1 + wrapNum2) {
        // 只需要换两行
        content =
          text.slice(0, wrapNum1) +
          "\n" +
          text.slice(wrapNum1, wrapNum1 + wrapNum2) +
          "\n" +
          text.slice(wrapNum1 + wrapNum2);
      } else if (text.length > wrapNum1) {
        // 只需要换一行
        content = text.slice(0, wrapNum1) + "\n" + text.slice(wrapNum1);
      } else {
        content = text;
      }
      return content;
    };

    // node drawShape方法-统一处理
    const nodeDrawShape = (cfg, group, r, fill) => {
      const circle = group.addShape("circle", {
        attrs: {
          x: 0,
          y: 0,
          r,
          fill,
          stroke: "#fff",
          lineWidth: 3,
        },
        name: "circle-shape",
        draggable: true,
      });

      let content = handleText(cfg.name);

      const text = group.addShape("text", {
        attrs: {
          text: content,
          textAlign: "center",
          fontSize: r / 3,
          textBaseline: "middle",
          lineHeight: r / 3 + 4,
          fill: "#fff",
        },
        name: "text-shape",
        draggable: true,
      });
      text.attr({
        x: 0,
        y: 0,
      });
      return circle;
    };

    // node setState方法统一处理
    const nodeSetState = (name, value, item) => {
      const group = item.getContainer();
      const circle = group.get("children")[0]; // 顺序根据 draw 时确定
      const text = group.get("children")[1]; // 顺序根据 draw 时确定
      if (name === "click" || (name === "hover" && !item.hasState("click"))) {
        if (value) {
          circle.attr("stroke", "#FFEBBB");
        } else {
          circle.attr("stroke", "white");
        }
      } else if (name === "gray") {
        if (value) {
          circle.attr("opacity", 0.3);
          text.attr("opacity", 0);
        } else {
          circle.attr("opacity", 1);
          text.attr("opacity", 1);
        }
      }
    };

    // 处理平行边
    const resetEdges = () => {
      const edges = graph.save().edges;
      const noLoopEdges = edges.filter((edge) => {
        if (edge.target !== edge.source) {
          return edge;
        }
      });
      G6.Util.processParallelEdges(noLoopEdges, 20);
      graph.getEdges().forEach((edge, i) => {
        graph.updateItem(
          edge,
          {
            curveOffset: edges[i].curveOffset,
            curvePosition: 0.425, // 手动调出来的
            labelCfg: {
              autoRotate: true,
              backgroundColor: "#fff",
            },
          },
          false
        );
      });
    };

    // 初始化图谱
    const initGraph = (dom) => {
      if (dom === "init") {
        dom = graphDom.value;
      }
      if (graph) {
        graph.destroy();
      }
      const width = dom.clientWidth;
      const height = dom.clientHeight;

      // 个人节点，暂时没加图片属性，等后期需求
      G6.registerNode(
        "person-node",
        {
          drawShape: function drawShape(cfg, group) {
            return nodeDrawShape(cfg, group, 36, "#FD6871");
          },
          // 响应状态变化
          setState(name, value, item) {
            nodeSetState(name, value, item);
          },
        },
        "circle"
      );

      // 企业节点
      G6.registerNode(
        "enterprise-node",
        {
          drawShape: function drawShape(cfg, group) {
            return nodeDrawShape(cfg, group, 36, "#69B1FF");
          },
          // 响应状态变化
          setState(name, value, item) {
            nodeSetState(name, value, item);
          },
        },
        "circle"
      );

      // 搜索的目标节点
      G6.registerNode(
        "target-node",
        {
          drawShape: function drawShape(cfg, group) {
            return nodeDrawShape(cfg, group, 48, "#FFCA69");
          },
          // 响应状态变化
          setState(name, value, item) {
            nodeSetState(name, value, item);
          },
        },
        "circle"
      );

      // tooltip
      const tooltip = useTooltip();

      // 初始化图谱
      graph = new G6.Graph({
        container: dom,
        width: width,
        height: height,
        minZoom: 0.5,
        maxZoom: 2.4,
        plugins: [tooltip],
        // linkCenter: true, // 指定边是否连入节点的中心。
        // enabledStack: true, // 是否启用 stack，即是否开启 redo & undo 功能
        // maxStep: 20, // 默认历史栈里最多存20步
        animate: true,
        animateCfg: {
          duration: 300, // Number，一次动画的时长
        },
        layout: {
          type: "radial",
          focusNode: id.value,
          linkDistance: 180, // 可选，边长
          maxIteration: 1000, // 可选 停止迭代到最大迭代数
          unitRadius: 260, // 可选 每一圈距离上一圈的距离。默认填充整个画布，即根据图的大小决定
          preventOverlap: true, // 可选 是否防止重叠，必须配合下面属性 nodeSize，只有设置了与当前图节点大小相同的 nodeSize 值，才能够进行节点重叠的碰撞检测
          nodeSize: 72, // 可选 节点大小（直径）。用于防止节点重叠时的碰撞检测
          // nodeSpacing: 10, // preventOverlap 为 true 时生效, 防止重叠时节点边缘间距的最小值。可以是回调函数, 为不同节点设置不同的最小间距
          maxPreventOverlapIteration: 1000, // 防止重叠步骤的最大迭代次数
          strictRadial: false, // 可选 是否必须是严格的 radial 布局，及每一层的节点严格布局在一个环上。preventOverlap 为 true 时生效。
          // workerEnabled: true, // 可选 是否启用 web-worker 以防布局计算时间过长阻塞页面交互
        },
        defaultNode: {
          type: "circle", // 节点类型
          size: 72, // 节点大小
        },
        defaultEdge: {
          type: "line",
          style: {
            lineWidth: 1,
            lineAppendWidth: 10,
          },
          labelCfg: {
            autoRotate: true,
            style: {
              lineWidth: 5,
              stroke: "#fff",
            },
          },
        },
        // 点边不同状态下的样式集合
        edgeStateStyles: {
          gray: {
            opacity: 0.3,
            "text-shape": {
              opacity: 0,
            },
            stroke: "#D6DBE3",
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 0, // 偏移量
              fill: "#D6DBE3",
            },
          },
        },

        modes: {
          default: ["drag-canvas", "drag-node"],
          direction: "both",
        },
      });

      // 绑定点击事件
      graph.on("node:click", (e) => {
        canvasClick();
        graph.setItemState(e.item, "click", true);
        // 先置灰所有点边，再高亮一度关系点边
        grayEles([...graph.getNodes(), ...graph.getEdges()]);
        highlightEles([...e.item.getNeighbors(), ...e.item.getEdges(), e.item]);
      });
      graph.on("canvas:click", () => {
        canvasClick();
      });

      // 悬浮事件
      graph.on("node:mouseenter", (e) => {
        graph.setItemState(e.item, "hover", true);
        // 获取节点详情数据
        const model = e.item.getModel();
        if (model.type !== "person-node") {
          getNodeDetail(model.id, tooltip, e);
        }
      });
      graph.on("node:mouseleave", (e) => {
        if (e.item.hasState("click")) return;
        graph.setItemState(e.item, "hover", false); // 切换选中
      });

      // 读取数据
      graph.data(graphData);
      // 渲染图
      graph.render();

      // 处理平行边
      resetEdges();

      // 监听窗口大小变化，动态修改画布大小
      if (typeof window !== "undefined") {
        window.onresize = () => {
          if (!graph || graph.get("destroyed")) return;
          if (!dom || !dom.scrollWidth || !dom.scrollHeight) return;
          const width = dom.clientWidth;
          const height = dom.clientHeight;
          graph.changeSize(width, height);
        };
      }
    };

    // 获取图谱数据
    const getGraphData = async (id, name) => {
      const json = {
        // keyNo: "916100006949266167",
        keyNo: id,
        name,
        label: "enterprise",
      };
      loading.value = true;
      const res = await getRelationGraph(json);
      loading.value = false;
      if (res.message === "Success") {
        graphData.nodes = res.data.nodesData.map((node) => {
          return {
            keyNo: node.id,
            id: node.id,
            name: node.nodeName,
            type:
              node.id === id
                ? "target-node"
                : node.label === "person"
                ? "person-node"
                : "enterprise-node",
            nodeType: node.label,
            size: node.id === id ? 72 : 72,
          };
        });
        graphData.edges = res.data.edgesData.map((edge) => {
          return {
            source: edge.sourceId,
            target: edge.targetId,
            label: edge.labelCnName,
            name: edge.labelCnName,
            style: {
              stroke:
                blueColorLabels.indexOf(edge.labelCnName) === -1
                  ? "#FD6871"
                  : "#69B1FF",
              endArrow: {
                path: G6.Arrow.triangle(10, 10, 0), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                d: 0, // 偏移量
                fill:
                  blueColorLabels.indexOf(edge.labelCnName) === -1
                    ? "#FD6871"
                    : "#69B1FF",
              },
            },
            labelCfg: {
              style: {
                fill:
                  blueColorLabels.indexOf(edge.labelCnName) === -1
                    ? "#FD6871"
                    : "#69B1FF",
              },
            },
          };
        });
        initGraph(graphDom.value);
      } else {
        message.error(res.message);
      }
    };

    // 为何多此一举的写下面的方法：因为暴露出去给graphtool组件使用的graph读取不到，不知道为什么，无奈才写的下面的一系列方法
    const handleRefresh = () => {
      refreshGraph(graph);
    };

    const handlePlus = () => {
      plusGraph(graph, graphDom, canvasRatio);
    };

    const handleMinus = () => {
      minusGraph(graph, graphDom, canvasRatio);
    };

    const handleReset = () => {
      resetGraph(graph, graphDom, canvasRatio);
    };

    const handleTextShow = (flag) => {
      graph.clear();
      graphData.edges = graphData.edges.map((edge) => {
        return {
          ...edge,
          label: flag ? edge.name : null,
        };
      });
      // 读取数据
      graph.data(graphData);
      // 渲染图
      graph.render();

      // 处理平行边
      resetEdges();
    };

    watch(
      [() => store.state.enterpriseId, () => store.state.enterpriseName],
      (newValue) => {
        id.value = newValue[0];
        name.value = newValue[1];
      },
      { immediate: true }
    );

    watchEffect(() => {
      if (id.value && name.value) {
        setTimeout(() => {
          getGraphData(id.value, name.value);
        }, 500);
      }
    });

    return {
      id,
      name,
      loading,
      graphDom,
      initGraph,
      handleRefresh,
      handlePlus,
      handleMinus,
      handleReset,
      handleTextShow,
    };
  },
};
</script>
<style lang="less" scoped>
.relation-graph {
  width: 100%;
  height: 100%;

  .detail-tooltip {
    &-name {
      font-size: 16px;
      color: #3c485c;
      line-height: 22px;
    }
  }
}
</style>
