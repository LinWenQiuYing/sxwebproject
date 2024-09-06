<template>
  <graphTool
    :searchValue="name"
    :selectedIndex="2"
    v-if="id"
    @initGraph="initGraph"
    @handlePlus="handlePlus"
    @handleMinus="handleMinus"
    @handleReset="handleReset"
    @handleRefresh="handleRefresh"
  />
  <a-spin
    v-if="searchLoading"
    size="large"
    tip="正在加载..."
    class="main-spin"
  />
  <div class="stock-graph" ref="graphDom"></div>
</template>
<script>
import { ref, reactive, watch, watchEffect } from "vue";
import G6 from "@antv/g6";
import { message, Spin } from "ant-design-vue";
import { getInvest, getOwnership } from "@/shared/api/affairGraph";
import useTooltip, { getNodeDetail } from "../hooks/tooltip";
import {
  refreshGraph,
  plusGraph,
  minusGraph,
  resetGraph,
} from "../hooks/graphActions";
import { nanoid } from "nanoid";
import { useStore } from "vuex";
import graphTool from "./graphTool";

export default {
  name: "StockGraph",
  components: {
    ASpin: Spin,
    graphTool,
  },
  setup() {
    const graphDom = ref(null);
    const store = useStore(); // 路由对象
    const id = ref(store.state.enterpriseId);
    const name = ref(store.state.enterpriseName);
    const token = ref(store.state.token);
    const maxDepth = ref(store.state.depth);
    const searchLoading = ref(true);
    const graphData = reactive({
      id: "",
      name: "",
      isTop: true,
      children: [],
    });
    let graph = null;
    let canvasRatio = ref(1); // 图谱放大缩小比例

    const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
      return [
        ["M", x - r, y],
        ["a", r, r, 0, 1, 0, r * 2, 0],
        ["a", r, r, 0, 1, 0, -r * 2, 0],
        ["M", x + 3 - r, y],
        ["L", x + r - 3, y],
      ];
    };
    const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
      return [
        ["M", x - r, y],
        ["a", r, r, 0, 1, 0, r * 2, 0],
        ["a", r, r, 0, 1, 0, -r * 2, 0],
        ["M", x + 3 - r, y],
        ["L", x + r - 3, y],
        ["M", x, y - r + 3],
        ["L", x, y + r - 3],
      ];
    };
    const getIcon = function getIcon(cfg) {
      if (cfg.hasChildren && cfg.collapsed === undefined) {
        return EXPAND_ICON;
      } else {
        return cfg.collapsed ? EXPAND_ICON : COLLAPSE_ICON;
      }
    };

    const initGraph = (dom) => {
      if (dom === "init") {
        dom = graphDom.value;
      }
      if (graph) {
        graph.destroy();
      }
      // 注册根节点
      G6.registerNode(
        "first-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const w = 192;
            const h = 48;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#1776FF",
                stroke: "#1776FF",
                width: w,
                height: h,
                x: -26, // 不加样式不对齐，很奇怪，不明原因
                y: 10,
              },
            });
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 10;
              let textY = 44 + 10;
              let content = cfg.name;
              if (cfg.name.length > wrapNum * 2) {
                content =
                  content.slice(0, wrapNum) +
                  "\n" +
                  content.slice(wrapNum, wrapNum * 2 - 1) +
                  "...";
              } else if (cfg.name.length > wrapNum) {
                content =
                  content.slice(0, wrapNum) + "\n" + content.slice(wrapNum);
              } else {
                textY = h - 16 + 10;
              }
              /**添加节点名称**/
              group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#fff",
                  fontSize: 16,
                  text: content,
                  lineHeight: 22,
                  textAlign: "center",
                  x: w / 2 - 26,
                  y: textY,
                },
              });
            }

            return keyShape;
          },
        },
        "rect"
      );

      // 注册普通节点
      G6.registerNode(
        "icon-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const w = styles.width;
            const h = styles.height;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: cfg.nodeType === "person" ? "#E6F4FF" : "#fff",
                stroke: cfg.nodeType === "person" ? "#1776FF" : "#D6DBE3",
                x: 0,
                y: 0,
              },
            });
            if (cfg.hasChildren) {
              group.addShape("marker", {
                attrs: {
                  x: w / 2,
                  y: cfg.showDirection === "in" ? -1 : h + 13,
                  r: 6,
                  stroke: "#fff",
                  fill: "#5F7292",
                  cursor: "pointer",
                  symbol: getIcon(cfg),
                },
                name: "collapse-icon",
              });
            }
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 8;
              let textY1 = 45.5; // ui图里的距离
              let textY2; // textY1 + 21 持股数文字高度
              let textY3 = 72 + 11 + 28; // rect高度 + 持股比例文字高度 + 偏移度
              let content = cfg.name;
              if (cfg.name.length > wrapNum * 2) {
                content =
                  content.slice(0, wrapNum) +
                  "\n" +
                  content.slice(wrapNum, wrapNum * 2 - 1) +
                  "...";
              } else if (cfg.name.length > wrapNum) {
                content =
                  content.slice(0, wrapNum) + "\n" + content.slice(wrapNum);
              } else {
                textY1 = 35.5;
              }
              textY2 = textY1 + 21;
              /**添加节点名称**/
              const name = group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#3C485C",
                  fontSize: 14,
                  text: content,
                  lineHeight: 20,
                  textAlign: "center",
                  x: w / 2,
                  y: textY1,
                },
              });
              /**持股金额信息**/
              if (cfg.money) {
                group.addShape("text", {
                  attrs: {
                    fill: "#97A3B7",
                    fontSize: 10,
                    text: "认缴金额: " + cfg.money + "万元",
                    textAlign: "center",
                    x: w / 2,
                    y: textY2,
                  },
                });
              } else {
                // 没有认缴金额，调整节点名称位置
                name.attr({
                  y: textY1 + 8,
                });
              }
              /**持股比例信息**/
              if (cfg.percent) {
                const text1 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent + "%",
                    textAlign: "center",
                  },
                });
                const bbox1 = text1.getBBox();
                text1.attr({
                  x: w / 2 + bbox1.width / 2 + 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
                /**持股比例文字**/
                group.addShape("rect", {
                  attrs: {
                    ...styles,
                    width: 22,
                    height: 13,
                    fill: "#E6F4FF",
                    lineWidth: 0,
                    radius: 2,
                    x: w / 2 - 29,
                    y: cfg.showDirection === "in" ? textY3 - 11 : -41,
                  },
                });
                const text2 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent > 50 ? "控股" : "持股",
                    textAlign: "center",
                  },
                });
                const bbox2 = text2.getBBox();
                text2.attr({
                  x: w / 2 - bbox2.width / 2 - 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
              }
            }

            return keyShape;
          },
          update: (cfg, item) => {
            const group = item.getContainer();
            const icon = group.find((e) => e.get("name") === "collapse-icon");
            icon.attr("symbol", getIcon(cfg));
          },
        },
        "rect"
      );

      // 实际控制人&最终受益人
      G6.registerNode(
        "both-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const w = styles.width;
            const h = styles.height;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#FFF9E6",
                stroke: "#FE9E17",
                x: 0,
                y: -23,
                height: h + 23,
              },
            });
            // 顶部颜色板
            group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#FE9E17",
                stroke: "#FE9E17",
                radius: [6, 6, 0, 0],
                x: 0,
                y: -23,
                height: 23,
              },
            });
            // 添加顶部标题文字
            group.addShape("text", {
              attrs: {
                fill: "#fff",
                stroke: "#FE9E17",
                fontSize: 12,
                text: "实际控制人&最终受益人",
                lineHeight: 17,
                textAlign: "center",
                x: w / 2,
                y: -4,
              },
            });
            // 添加顶部颜色板下的三角形
            group.addShape("polygon", {
              attrs: {
                points: [
                  [w / 2 - 5, 0],
                  [w / 2, 6],
                  [w / 2 + 5, 0],
                ],
                fill: "#FE9E17",
              },
              // must be assigned in G6 3.3 and later versions. it can be any value you want
              name: "polygon-shape",
            });

            if (cfg.hasChildren) {
              group.addShape("marker", {
                attrs: {
                  x: w / 2,
                  y: cfg.showDirection === "in" ? -1 - 23 : h + 13,
                  r: 6,
                  stroke: "#fff",
                  fill: "#5F7292",
                  cursor: "pointer",
                  symbol: getIcon(cfg),
                },
                name: "collapse-icon",
              });
            }
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 8;
              let textY1 = 45.5; // ui图里的距离
              let textY2; // textY1 + 21 持股数文字高度
              let textY3 = 72 + 11 + 28; // rect高度 + 持股比例文字高度 + 偏移度
              let content = cfg.name;
              if (cfg.name.length > wrapNum * 2) {
                content =
                  content.slice(0, wrapNum) +
                  "\n" +
                  content.slice(wrapNum, wrapNum * 2 - 1) +
                  "...";
              } else if (cfg.name.length > wrapNum) {
                content =
                  content.slice(0, wrapNum) + "\n" + content.slice(wrapNum);
              } else {
                textY1 = 35.5;
              }
              textY2 = textY1 + 21;
              /**添加节点名称**/
              const name = group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#3C485C",
                  fontSize: 14,
                  text: content,
                  lineHeight: 20,
                  textAlign: "center",
                  x: w / 2,
                  y: textY1,
                },
              });
              /**持股金额信息**/
              if (cfg.money) {
                group.addShape("text", {
                  attrs: {
                    fill: "#97A3B7",
                    fontSize: 10,
                    text: "认缴金额: " + cfg.money + "万元",
                    textAlign: "center",
                    x: w / 2,
                    y: textY2,
                  },
                });
              } else {
                // 没有认缴金额，调整节点名称位置
                name.attr({
                  y: textY1 + 8,
                });
              }
              /**持股比例信息**/
              if (cfg.percent) {
                const text1 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent + "%",
                    textAlign: "center",
                  },
                });
                const bbox1 = text1.getBBox();
                text1.attr({
                  x: w / 2 + bbox1.width / 2 + 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
                /**持股比例文字**/
                group.addShape("rect", {
                  attrs: {
                    ...styles,
                    width: 22,
                    height: 13,
                    fill: "#E6F4FF",
                    lineWidth: 0,
                    radius: 2,
                    x: w / 2 - 29,
                    y: cfg.showDirection === "in" ? textY3 - 11 : -41,
                  },
                });
                const text2 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent > 50 ? "控股" : "持股",
                    textAlign: "center",
                  },
                });
                const bbox2 = text2.getBBox();
                text2.attr({
                  x: w / 2 - bbox2.width / 2 - 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
              }
            }

            return keyShape;
          },
          update: (cfg, item) => {
            const group = item.getContainer();
            const icon = group.find((e) => e.get("name") === "collapse-icon");
            icon.attr("symbol", getIcon(cfg));
          },
        },
        "rect"
      );

      // 实际控制人
      G6.registerNode(
        "actual-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const w = styles.width;
            const h = styles.height;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#FFE6E5",
                stroke: "#E31430",
                x: 0,
                y: -23,
                height: h + 23,
              },
            });
            // 顶部颜色板
            group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#E31430",
                stroke: "#E31430",
                radius: [6, 6, 0, 0],
                x: 0,
                y: -23,
                height: 23,
              },
            });
            // 添加顶部标题文字
            group.addShape("text", {
              attrs: {
                fill: "#fff",
                stroke: "#E31430",
                fontSize: 12,
                text: "实际控制人",
                lineHeight: 17,
                textAlign: "center",
                x: w / 2,
                y: -4,
              },
            });
            // 添加顶部颜色板下的三角形
            group.addShape("polygon", {
              attrs: {
                points: [
                  [w / 2 - 5, 0],
                  [w / 2, 6],
                  [w / 2 + 5, 0],
                ],
                fill: "#E31430",
              },
              // must be assigned in G6 3.3 and later versions. it can be any value you want
              name: "polygon-shape",
            });

            if (cfg.hasChildren) {
              group.addShape("marker", {
                attrs: {
                  x: w / 2,
                  y: cfg.showDirection === "in" ? -1 - 23 : h + 13,
                  r: 6,
                  stroke: "#fff",
                  fill: "#5F7292",
                  cursor: "pointer",
                  symbol: getIcon(cfg),
                },
                name: "collapse-icon",
              });
            }
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 8;
              let textY1 = 45.5; // ui图里的距离
              let textY2; // textY1 + 21 持股数文字高度
              let textY3 = 72 + 11 + 28; // rect高度 + 持股比例文字高度 + 偏移度
              let content = cfg.name;
              if (cfg.name.length > wrapNum * 2) {
                content =
                  content.slice(0, wrapNum) +
                  "\n" +
                  content.slice(wrapNum, wrapNum * 2 - 1) +
                  "...";
              } else if (cfg.name.length > wrapNum) {
                content =
                  content.slice(0, wrapNum) + "\n" + content.slice(wrapNum);
              } else {
                textY1 = 35.5;
              }
              textY2 = textY1 + 21;
              /**添加节点名称**/
              const name = group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#3C485C",
                  fontSize: 14,
                  text: content,
                  lineHeight: 20,
                  textAlign: "center",
                  x: w / 2,
                  y: textY1,
                },
              });
              /**持股金额信息**/
              if (cfg.money) {
                group.addShape("text", {
                  attrs: {
                    fill: "#97A3B7",
                    fontSize: 10,
                    text: "认缴金额: " + cfg.money + "万元",
                    textAlign: "center",
                    x: w / 2,
                    y: textY2,
                  },
                });
              } else {
                // 没有认缴金额，调整节点名称位置
                name.attr({
                  y: textY1 + 8,
                });
              }
              /**持股比例信息**/
              if (cfg.percent) {
                const text1 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent + "%",
                    textAlign: "center",
                  },
                });
                const bbox1 = text1.getBBox();
                text1.attr({
                  x: w / 2 + bbox1.width / 2 + 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
                /**持股比例文字**/
                group.addShape("rect", {
                  attrs: {
                    ...styles,
                    width: 22,
                    height: 13,
                    fill: "#E6F4FF",
                    lineWidth: 0,
                    radius: 2,
                    x: w / 2 - 29,
                    y: cfg.showDirection === "in" ? textY3 - 11 : -41,
                  },
                });
                const text2 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent > 50 ? "控股" : "持股",
                    textAlign: "center",
                  },
                });
                const bbox2 = text2.getBBox();
                text2.attr({
                  x: w / 2 - bbox2.width / 2 - 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
              }
            }

            return keyShape;
          },
          update: (cfg, item) => {
            const group = item.getContainer();
            const icon = group.find((e) => e.get("name") === "collapse-icon");
            icon.attr("symbol", getIcon(cfg));
          },
        },
        "rect"
      );

      // 最终受益人
      G6.registerNode(
        "final-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const w = styles.width;
            const h = styles.height;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#F0F5FF",
                stroke: "#2A43C2",
                x: 0,
                y: -23,
                height: h + 23,
              },
            });
            // 顶部颜色板
            group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#2A43C2",
                stroke: "#2A43C2",
                radius: [6, 6, 0, 0],
                x: 0,
                y: -23,
                height: 23,
              },
            });
            // 添加顶部标题文字
            group.addShape("text", {
              attrs: {
                fill: "#fff",
                stroke: "#2A43C2",
                fontSize: 12,
                text: "最终受益人",
                lineHeight: 17,
                textAlign: "center",
                x: w / 2,
                y: -4,
              },
            });
            // 添加顶部颜色板下的三角形
            group.addShape("polygon", {
              attrs: {
                points: [
                  [w / 2 - 5, 0],
                  [w / 2, 6],
                  [w / 2 + 5, 0],
                ],
                fill: "#2A43C2",
              },
              // must be assigned in G6 3.3 and later versions. it can be any value you want
              name: "polygon-shape",
            });

            if (cfg.hasChildren) {
              group.addShape("marker", {
                attrs: {
                  x: w / 2,
                  y: cfg.showDirection === "in" ? -1 - 23 : h + 13,
                  r: 6,
                  stroke: "#fff",
                  fill: "#5F7292",
                  cursor: "pointer",
                  symbol: getIcon(cfg),
                },
                name: "collapse-icon",
              });
            }
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 8;
              let textY1 = 45.5; // ui图里的距离
              let textY2; // textY1 + 21 持股数文字高度
              let textY3 = 72 + 11 + 28; // rect高度 + 持股比例文字高度 + 偏移度
              let content = cfg.name;
              if (cfg.name.length > wrapNum * 2) {
                content =
                  content.slice(0, wrapNum) +
                  "\n" +
                  content.slice(wrapNum, wrapNum * 2 - 1) +
                  "...";
              } else if (cfg.name.length > wrapNum) {
                content =
                  content.slice(0, wrapNum) + "\n" + content.slice(wrapNum);
              } else {
                textY1 = 35.5;
              }
              textY2 = textY1 + 21;
              /**添加节点名称**/
              const name = group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#3C485C",
                  fontSize: 14,
                  text: content,
                  lineHeight: 20,
                  textAlign: "center",
                  x: w / 2,
                  y: textY1,
                },
              });
              /**持股金额信息**/
              if (cfg.money) {
                group.addShape("text", {
                  attrs: {
                    fill: "#97A3B7",
                    fontSize: 10,
                    text: "认缴金额: " + cfg.money + "万元",
                    textAlign: "center",
                    x: w / 2,
                    y: textY2,
                  },
                });
              } else {
                // 没有认缴金额，调整节点名称位置
                name.attr({
                  y: textY1 + 8,
                });
              }
              /**持股比例信息**/
              if (cfg.percent) {
                const text1 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent + "%",
                    textAlign: "center",
                  },
                });
                const bbox1 = text1.getBBox();
                text1.attr({
                  x: w / 2 + bbox1.width / 2 + 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
                /**持股比例文字**/
                group.addShape("rect", {
                  attrs: {
                    ...styles,
                    width: 22,
                    height: 13,
                    fill: "#E6F4FF",
                    lineWidth: 0,
                    radius: 2,
                    x: w / 2 - 29,
                    y: cfg.showDirection === "in" ? textY3 - 11 : -41,
                  },
                });
                const text2 = group.addShape("text", {
                  attrs: {
                    fill: "#1776FF",
                    fontSize: 8,
                    lineHeight: 11,
                    text: cfg.percent > 50 ? "控股" : "持股",
                    textAlign: "center",
                  },
                });
                const bbox2 = text2.getBBox();
                text2.attr({
                  x: w / 2 - bbox2.width / 2 - 10,
                  y: cfg.showDirection === "in" ? textY3 : -30,
                });
              }
            }

            return keyShape;
          },
          update: (cfg, item) => {
            const group = item.getContainer();
            const icon = group.find((e) => e.get("name") === "collapse-icon");
            icon.attr("symbol", getIcon(cfg));
          },
        },
        "rect"
      );

      // 注册折线边
      G6.registerEdge("flow-line", {
        draw(cfg, group) {
          const startPoint = cfg.startPoint;
          const endPoint = cfg.endPoint;
          const { style } = cfg;
          if (cfg.targetNode._cfg.model.showDirection === "out") {
            //out代表对外投资
            let shape = group.addShape("path", {
              attrs: {
                stroke: style.stroke,
                endArrow: style.endArrow,
                path: [
                  ["M", startPoint.x, startPoint.y],
                  [
                    "L",
                    startPoint.x,
                    (startPoint.y + cfg.targetNode.getBBox().minY) / 2,
                  ],
                  [
                    "L",
                    endPoint.x,
                    (startPoint.y + cfg.targetNode.getBBox().minY) / 2,
                  ],
                  ["L", endPoint.x, cfg.targetNode.getBBox().minY],
                ],
              },
            });
            return shape;
          } else {
            let shape = group.addShape("path", {
              attrs: {
                stroke: style.stroke,
                endArrow: style.reverseArrow,
                path: [
                  ["M", startPoint.x, startPoint.y],
                  [
                    "L",
                    startPoint.x,
                    (startPoint.y + cfg.targetNode.getBBox().maxY) / 2,
                  ],
                  [
                    "L",
                    endPoint.x,
                    (startPoint.y + cfg.targetNode.getBBox().maxY) / 2,
                  ],
                  ["L", endPoint.x, cfg.targetNode.getBBox().maxY],
                ],
              },
            });
            return shape;
          }
        },
      });
      const defaultStateStyles = {
        hover: {
          stroke: "#1776FF",
          lineWidth: 1.6,
        },
      };

      const defaultNodeStyle = {
        fill: "#fff",
        stroke: "#1776FF",
        radius: 6,
        lineWidth: 1,
      };

      const defaultEdgeStyle = {
        stroke: "#E3E6EB",
        endArrow: {
          path: "M 0,0 L 7.5, 4.75 L 7.5,0 L 7.5, -4.75 Z",
          fill: "#1776FF",
          stroke: "#1776FF",
          d: -30,
        },
        reverseArrow: {
          path: "M 7.5,0 L 0, 4.75 L 0,0 L 0, -4.75 Z",
          fill: "#1776FF",
          stroke: "#1776FF",
          d: -30,
        },
      };

      const defaultLayout = {
        type: "compactBox",
        direction: "V", //V 垂直分布  H 水平分布
        getId: function getId(d) {
          return d.id;
        },
        getVGap: function getVGap() {
          return 80;
        },
        getHGap: function getHGap() {
          return 78;
        },
        getSide: (d) => {
          /**上下布局，此处判断在节点上还是下**/
          if (d.data.showDirection === "out") {
            return "right";
          } else {
            return "left";
          }
        },
      };

      const defaultLabelCfg = {
        style: {
          fill: "#3C485C",
          fontSize: 14,
          fontFamily: "PingFang SC",
        },
      };

      // tooltip
      const tooltip = useTooltip();

      const width = dom.clientWidth;
      const height = dom.clientHeight;
      graph = new G6.TreeGraph({
        container: dom,
        width,
        height,
        linkCenter: true,
        plugins: [tooltip],
        modes: {
          default: ["drag-canvas", "zoom-canvas"],
        },
        defaultNode: {
          type: "icon-node",
          size: [140, 72],
          style: defaultNodeStyle,
          labelCfg: defaultLabelCfg,
        },
        defaultEdge: {
          type: "flow-line",
          style: defaultEdgeStyle,
        },
        nodeStateStyles: defaultStateStyles,
        edgeStateStyles: defaultStateStyles,
        layout: defaultLayout,
      });

      // 监听事件
      graph.on("mousemove", (e) => {
        graph.get("canvas").set("localRefresh", false); // gitee上查到的避免拖动出现重影的方法
      });

      graph.on("node:mouseenter", (e) => {
        // 获取节点详情数据
        const model = e.item.getModel();
        if (model.type !== "person-node") {
          getNodeDetail(model.keyNo, tooltip, e);
        }
      });

      // 点击事件
      graph.on("node:click", handleClickNode);
      graph.on("node:touchend", handleClickNode);

      graph.node((node) => {
        if (node.isTop) {
          return {
            ...node,
            type: "first-node",
          };
        } else if (node.isFinalControl && node.isActualControl) {
          // 实际控制人&最终受益人
          return {
            ...node,
            type: "both-node",
          };
        } else if (node.isFinalControl) {
          // 最终受益人
          return {
            ...node,
            type: "final-node",
          };
        } else if (node.isActualControl) {
          // 实际控制人
          return {
            ...node,
            type: "actual-node",
          };
        } else {
          return { ...node };
        }
      });

      graph.data(graphData);
      graph.render();
      graph.fitCenter();

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

    // 点击展开节点
    const handleClickNode = async (evt) => {
      let { item, target } = evt;
      let targetType = target.get("type");
      const model = item.getModel();
      const upDownType = model.showDirection; // in / out
      if (targetType === "marker" && model.depth < maxDepth.value) {
        if (target.attr("symbol") === EXPAND_ICON) {
          //判断点击为'+'号--展开
          let result = [];
          if (model.copyChildren.length) {
            result = model.copyChildren;
          } else {
            if (upDownType === "in") {
              result = await getUpData(model.keyNo);
            } else {
              result = await getDownData(model.keyNo);
            }
          }
          model.children = result;
          const icon = item
            .get("group")
            .find((element) => element.get("name") === "collapse-icon");
          icon.attr("symbol", COLLAPSE_ICON);
          model.collapsed = false;
          graph.updateChild(model, model.id);
          if (!result.length) {
            // 实际没有children数据，则置hasChildren为false
            model.hasChildren = false;
            return false;
          }
          graph.focusItem(model.id);
        } else if (target.attr("symbol") === COLLAPSE_ICON) {
          model.copyChildren = model.children;
          model.children = [];
          const icon = item
            .get("group")
            .find((element) => element.get("name") === "collapse-icon");
          icon.attr("symbol", EXPAND_ICON);
          model.collapsed = true;
          graph.updateChild(model, model.id);
          if (!model.hasChildren) {
            return false;
          }
          graph.focusItem(model.id);
        }
      } else if (targetType === "marker" && model.depth >= maxDepth.value) {
        message.info("当前已达到最大层级！");
      }
    };

    const getTreeData = async (id) => {
      graphData.id = id;
      graphData.name = name.value;
      graphData.nodeType = "enterprise";
      graphData.keyNo = id;
      graphData.children = [];
      // {
      //   "keyNo": "91610000667992837D",
      //   "label": "enterprise",
      //   "name": "陕西广电移动电视有限公司",
      //   "investRatio": 0.679,
      //   "holding": 1,
      //   "actualControl": 0,
      //   "finalControl": null,
      //   "upDown": 0
      // },
      const upData = await getUpData(id);
      const downData = await getDownData(id);
      graphData.children = [...graphData.children, ...upData, ...downData];
      console.log("graphData", graphData);
      searchLoading.value = true;
      initGraph(graphDom.value);
      searchLoading.value = false;
    };

    const getUpData = async (id) => {
      const json = {
        keyNo: id,
        level: 1, // todo 后期可能绑定权限
      };
      const result = [];
      const res = await getOwnership(json);
      if (res.message === "Success") {
        res.data.investResultList.map((item) => {
          result.push({
            keyNo: item.keyNo,
            id: nanoid(),
            name: item.name,
            showDirection: "in",
            isActualControl: item.actualControl === 1 ? true : false,
            isFinalControl: item.finalControl === 1 ? true : false,
            hasChildren: item.hasUpStream === 1 ? true : false,
            nodeType: item.label,
            percent: item.investRatio
              ? (item.investRatio * 100).toFixed(2)
              : null,
            money: item.contributeMoney,
            children: [],
            copyChildren: [],
          });
        });
      } else {
        message.error(res.message);
      }
      return result;
    };

    const getDownData = async (id) => {
      const json = {
        keyNo: id,
        level: 1, // todo 后期可能绑定权限
      };
      const result = [];
      const res = await getInvest(json);
      if (res.message === "Success") {
        res.data.investResultList.map((item) => {
          result.push({
            keyNo: item.keyNo,
            id: nanoid(),
            name: item.name,
            showDirection: "out",
            hasChildren: item.hasDownStream === 1 ? true : false,
            nodeType: item.label,
            percent: item.investRatio
              ? (item.investRatio * 100).toFixed(2)
              : null,
            money: item.contributeMoney,
            children: [],
            copyChildren: [],
          });
        });
      } else {
        message.error(res.message);
      }
      return result;
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

    watch(
      [
        () => store.state.enterpriseId,
        () => store.state.enterpriseName,
        () => store.state.depth,
      ],
      (newValue) => {
        id.value = newValue[0];
        name.value = newValue[1];
        maxDepth.value = newValue[2];
      },
      { immediate: true }
    );

    watchEffect(() => {
      if (id.value && name.value && token.value) {
        setTimeout(() => {
          getTreeData(id.value);
        }, 500);
      }
    });

    return {
      id,
      name,
      graphDom,
      searchLoading,
      initGraph,
      handleRefresh,
      handlePlus,
      handleMinus,
      handleReset,
    };
  },
};
</script>
<style lang="less" scoped>
.stock-graph {
  width: 100%;
  height: 100%;
}
</style>
