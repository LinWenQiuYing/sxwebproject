<template>
  <graphTool
    :searchValue="name"
    :selectedIndex="1"
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
  <div class="enterprise-graph" ref="graphDom"></div>
</template>
<script>
import { ref, reactive, watch, watchEffect } from "vue";
import G6 from "@antv/g6";
import {
  enterpriseGraphIn,
  enterpriseGraphOut,
  personGraph,
} from "@/shared/api/affairGraph";
import { message, Spin } from "ant-design-vue";
import { nanoid } from "nanoid";
import useTooltip, { getNodeDetail } from "../hooks/tooltip";
import {
  refreshGraph,
  plusGraph,
  minusGraph,
  resetGraph,
} from "../hooks/graphActions";
import { useStore } from "vuex";
import graphTool from "./graphTool";

export default {
  name: "EnterpriseGraph",
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
      id: "海南巧易科技有限公司海南巧易科技有限公司",
      name: "海南巧易科技有限公司",
      isTop: true,
      children: [
        // {
        //   id: "c1",
        //   name: "海南巧易科",
        //   showDirection: "out",
        //   hasChildren: true,
        //   collapsed: false,
        //   nodeType: "label",
        //   percent: 100,
        //   children: [
        //     {
        //       id: "c1-1",
        //       name: "测试测试测试测试",
        //       post: "主管",
        //       hasChildren: true,
        //       nodeType: "person",
        //       showDirection: "out",
        //       children: [
        //         // {
        //         //   children: [],
        //         //   collapsed: false,
        //         //   depth: 3,
        //         //   hasChildren: true,
        //         //   id: "GqM_r5m_dZVWqZBEqYUSX",
        //         //   keyNo: null,
        //         //   labelCfg: { style: {} },
        //         //   name: "测试测试测试",
        //         //   nodeType: "label",
        //         //   showDirection: "out",
        //         //   size: (2)[(140, 72)],
        //         //   style: {
        //         //     hover: {},
        //         //     fill: "#fff",
        //         //     stroke: "#1776FF",
        //         //     radius: 2,
        //         //     lineWidth: 1,
        //         //   },
        //         //   type: "label-node",
        //         // },
        //         // {
        //         //   children: [],
        //         //   collapsed: false,
        //         //   depth: 3,
        //         //   id: "c1-1-2",
        //         //   name: "蔡徐坤",
        //         //   nodeType: "label",
        //         //   showDirection: "out",
        //         // },
        //         // {
        //         //   id: "c1-1-3",
        //         //   name: "海南巧易科技有限公司",
        //         //   nodeType: "label",
        //         //   showDirection: "out",
        //         // },
        //       ],
        //     },
        //     {
        //       id: "c1-2",
        //       name: "海南巧易科技有限公司海南巧易科技有限公司",
        //       money: 100,
        //       showDirection: "out",
        //       hasChildren: true,
        //       nodeType: "enterprise",
        //       collapsed: false,
        //     },
        //     {
        //       id: "c1-3",
        //       name: "蔡徐坤",
        //       nodeType: "person",
        //       showDirection: "out",
        //     },
        //   ],
        // },
        // {
        //   id: "c3",
        //   name: "海南",
        //   showDirection: "in",
        //   hasChildren: true,
        //   collapsed: false,
        //   nodeType: "label",
        //   percent: 100,
        //   children: [],
        // },
        // {
        //   id: "c4",
        //   name: "海南巧易科技有限公司海",
        //   showDirection: "in",
        //   hasChildren: true,
        //   collapsed: false,
        //   nodeType: "label",
        //   percent: 100,
        //   children: [],
        // },
        // {
        //   id: "c5",
        //   name: "海南巧易",
        //   showDirection: "out",
        //   hasChildren: true,
        //   collapsed: false,
        //   nodeType: "label",
        //   percent: 100,
        //   children: [],
        // },
        // {
        //   id: "c2",
        //   name: "海南巧易科",
        //   showDirection: "in",
        //   hasChildren: true,
        //   collapsed: false,
        //   nodeType: "label",
        //   percent: 100,
        //   children: [
        //     {
        //       id: "c2-1",
        //       name: "测试测试测试测试",
        //       post: "主管",
        //       hasChildren: true,
        //       nodeType: "person",
        //       showDirection: "in",
        //       children: [
        //         // {
        //         //   children: [],
        //         //   collapsed: false,
        //         //   depth: 3,
        //         //   hasChildren: true,
        //         //   id: "fdsfasfd",
        //         //   keyNo: null,
        //         //   labelCfg: { style: {} },
        //         //   name: "测试测试测试",
        //         //   nodeType: "label",
        //         //   showDirection: "in",
        //         //   size: (2)[(140, 72)],
        //         //   style: {
        //         //     hover: {},
        //         //     fill: "#fff",
        //         //     stroke: "#1776FF",
        //         //     radius: 2,
        //         //     lineWidth: 1,
        //         //   },
        //         //   type: "label-node",
        //         // },
        //         // {
        //         //   children: [],
        //         //   collapsed: false,
        //         //   depth: 3,
        //         //   id: "c2-1-2",
        //         //   name: "蔡徐坤",
        //         //   nodeType: "label",
        //         //   showDirection: "in",
        //         // },
        //         // {
        //         //   id: "c2-1-3",
        //         //   name: "海南巧易科技有限公司",
        //         //   nodeType: "label",
        //         //   showDirection: "in",
        //         // },
        //       ],
        //     },
        //     {
        //       id: "c2-2",
        //       name: "海南巧易科技有限公司海南巧易科技有限公司",
        //       money: 100,
        //       showDirection: "in",
        //       hasChildren: true,
        //       nodeType: "enterprise",
        //       collapsed: false,
        //     },
        //     {
        //       id: "c2-3",
        //       name: "蔡徐坤",
        //       nodeType: "person",
        //       showDirection: "in",
        //     },
        //   ],
        // },
      ],
    });
    let graph = null;
    let canvasRatio = ref(1); // 图谱放大缩小比例
    // 只有中间这个节点会分左右，其他节点就不分左右了，在左边的展开都在左边，在右边的展开都在右边
    const leftLabels = [
      "控股企业",
      "分支机构",
      "供应商",
      "历史对外投资",
      "历史法人",
    ];
    const labelColors = {
      控股企业: "#FC7A74",
      分支机构: "#FDAB0C",
      供应商: "#88A4FF",
      历史对外投资: "#40B400",
      历史法人: "#D0B0F8",
      法定代表人: "#D7B701",
      实际控制人: "#FE4C50",
      最终受益人: "#FF7E48",
      股东: "#009A99",
      高管: "#379E1A",
      对外投资: "#038BF2",
    };

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
                y: -13,
              },
            });
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 10;
              let textY = 44 - 13;
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
                textY = h - 16 - 13;
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

      // 注册中间类型节点
      G6.registerNode(
        "label-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: labelColors[cfg.name] ? labelColors[cfg.name] : "#038BF2",
                stroke: labelColors[cfg.name]
                  ? labelColors[cfg.name]
                  : "#038BF2",
                x: 0,
                y: 0,
                width: 0,
                height: 0,
              },
            });
            // 添加三角形箭头
            group.addShape("polygon", {
              attrs: {
                points:
                  cfg.showDirection === "in" && cfg.arrowDirection === "out"
                    ? [
                        [82, 13.5],
                        [69, 11],
                        [82, 8.5],
                      ]
                    : cfg.showDirection === "in" && cfg.arrowDirection === "in"
                    ? [
                        [70, 13.5],
                        [83, 11],
                        [70, 8.5],
                      ]
                    : cfg.showDirection === "out" &&
                      cfg.arrowDirection === "out"
                    ? [
                        [-19, 13.5],
                        [-6, 11],
                        [-19, 8.5],
                      ]
                    : cfg.showDirection === "out" && cfg.arrowDirection === "in"
                    ? [
                        [-7, 13.5],
                        [-20, 11],
                        [-7, 8.5],
                      ]
                    : [
                        [-7, 13.5],
                        [-20, 11],
                        [-7, 8.5],
                      ],
                fill: "#1776FF",
              },
              // must be assigned in G6 3.3 and later versions. it can be any value you want
              name: "polygon-shape",
            });

            let text = null;
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 7;
              let textY = 18; // 调试出来的距离
              let content = cfg.name;
              if (cfg.name.length > wrapNum) {
                content = content.slice(0, wrapNum - 1) + "...";
              }
              /**添加节点名称**/
              text = group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#fff",
                  fontSize: 12,
                  text: content,
                  lineHeight: 17,
                  textAlign: "left",
                  x: 0, // 先设为0，下面会动态设置
                  y: textY,
                },
              });
              const bbox = text.getBBox();
              keyShape.attr({
                x: cfg.showDirection === "in" ? 36 - (bbox.width + 9) : 20,
                width: bbox.width + 16,
                height: bbox.height + 10,
              });
              text.attr({
                x: cfg.showDirection === "in" ? 36 - (bbox.width + 1) : 28,
              });
            }
            if (cfg.hasChildren) {
              const bbox = keyShape.getBBox();
              group.addShape("marker", {
                attrs: {
                  x:
                    cfg.showDirection === "in"
                      ? 42 - bbox.width
                      : bbox.width + 22,
                  y: bbox.height / 2,
                  r: 6,
                  lineWidth: 1,
                  stroke: "#fff",
                  fill: labelColors[cfg.name]
                    ? labelColors[cfg.name]
                    : "#038BF2",
                  cursor: "pointer",
                  symbol: getIcon(cfg),
                },
                name: "collapse-icon",
              });

              text.attr({
                x: cfg.showDirection === "in" ? 42 - bbox.width + 10 : 28,
              });

              // 修正keyShape的width
              keyShape.attr({
                x: cfg.showDirection === "in" ? bbox.x - 16 : bbox.x,
                width: bbox.width + 16,
              });
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

      // 注册普通节点
      G6.registerNode(
        "text-node",
        {
          draw(cfg, group) {
            const styles = this.getShapeStyle(cfg);
            const { labelCfg = {} } = cfg;

            const keyShape = group.addShape("rect", {
              attrs: {
                ...styles,
                fill: "#fff",
                stroke: labelColors[cfg.parentLabel]
                  ? labelColors[cfg.parentLabel]
                  : "#038BF2",
                width: 0,
                height: 0,
                x: 0,
                y: 0,
              },
            });

            let text1 = null; // 节点名称文字
            let text2 = null; // 节点任职文字
            let text3 = null; // 节点认缴金额文字
            if (cfg.name) {
              /** 判断文字位置，折行等 **/
              const wrapNum = 10;
              let textY1 = 18; // ui图里的距离
              let content = cfg.name;
              if (cfg.name.length > wrapNum) {
                content = content.slice(0, wrapNum - 1) + "...";
              }
              /**添加节点名称**/
              text1 = group.addShape("text", {
                attrs: {
                  ...labelCfg.style,
                  fill: "#3C485C",
                  fontSize: 12,
                  text: content,
                  lineHeight: 17,
                  textAlign: "left",
                  x: 0,
                  y: textY1,
                },
              });
              const bbox = text1.getBBox();
              keyShape.attr({
                x: cfg.showDirection === "in" ? 231 - bbox.width : 124,
                width: bbox.width + 16,
                height: bbox.height + 10,
              });
              text1.attr({
                x: cfg.showDirection === "in" ? 231 - bbox.width + 8 : 124 + 8,
              });
              /**个人职位信息**/
              if (cfg.post) {
                text2 = group.addShape("text", {
                  attrs: {
                    fill: "#97A3B7",
                    fontSize: 12,
                    lineHeight: 17,
                    text: `（${cfg.post}）`,
                    textAlign: "left",
                    x: 0,
                    y: textY1,
                  },
                });

                // 修正keyShape的width和x
                keyShape.attr({
                  x:
                    cfg.showDirection === "in"
                      ? keyShape.getBBox().x - text2.getBBox().width + 8
                      : keyShape.getBBox().x,
                  width: keyShape.getBBox().width + text2.getBBox().width - 8,
                });

                // 修正text1和text2的x
                text1.attr({
                  x:
                    cfg.showDirection === "in"
                      ? bbox.x - 4
                      : keyShape.getBBox().x + 8,
                });
                text2.attr({
                  x:
                    cfg.showDirection === "in"
                      ? keyShape.getBBox().x + text1.getBBox().width + 8
                      : keyShape.getBBox().x + 8 + text1.getBBox().width,
                });
              }
              /**企业认缴信息**/
              if (cfg.money) {
                text3 = group.addShape("text", {
                  attrs: {
                    fill: "#97A3B7",
                    fontSize: 12,
                    lineHeight: 17,
                    // text: "认缴金额：" + cfg.money + "万（元）",
                    text: "[" + cfg.money + "%]",
                    textAlign: "left",
                    x: 0,
                    y: textY1,
                  },
                });

                // 修正keyShape的width和x
                keyShape.attr({
                  x:
                    cfg.showDirection === "in"
                      ? keyShape.getBBox().x - text3.getBBox().width
                      : keyShape.getBBox().x,
                  width: keyShape.getBBox().width + text3.getBBox().width,
                });

                // 修正text1和text2的x
                text1.attr({
                  x:
                    cfg.showDirection === "in"
                      ? bbox.x - 4
                      : keyShape.getBBox().x + 8,
                });
                text3.attr({
                  x:
                    cfg.showDirection === "in"
                      ? keyShape.getBBox().x + text1.getBBox().width + 12
                      : keyShape.getBBox().x + 8 + text1.getBBox().width,
                });
              }
            }

            if (cfg.hasChildren) {
              // 修正keyShape的width
              keyShape.attr({
                x:
                  cfg.showDirection === "in"
                    ? keyShape.getBBox().x - 16
                    : keyShape.getBBox().x,
                width: keyShape.getBBox().width + 16,
              });

              group.addShape("marker", {
                attrs: {
                  x:
                    cfg.showDirection === "in"
                      ? keyShape.getBBox().x + 16
                      : keyShape.getBBox().x + keyShape.getBBox().width - 16,
                  y: 11,
                  r: 6,
                  stroke: "#fff",
                  fill: "#5F7292",
                  cursor: "pointer",
                  symbol: getIcon(cfg),
                },
                name: "collapse-icon",
              });

              text1.attr({
                x:
                  cfg.showDirection === "in"
                    ? keyShape.getBBox().x + 26
                    : keyShape.getBBox().x + 8,
              });
              // if (text2) {
              //   text2.attr({
              //     x:
              //       cfg.showDirection === "in"
              //         ? text2.getBBox().x
              //         : text2.getBBox().x,
              //   });
              // }
              // if (text3) {
              //   text3.attr({
              //     x:
              //       cfg.showDirection === "in"
              //         ? text3.getBBox().x
              //         : text3.getBBox().x,
              //   });
              // }
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
          if (cfg.targetNode._cfg.model.showDirection === "out") {
            //out代表对外投资
            let shape = group.addShape("path", {
              attrs: {
                stroke: labelColors[cfg.sourceNode.getModel().name]
                  ? labelColors[cfg.sourceNode.getModel().name]
                  : "#1776FF",
                endArrow: {
                  path: "",
                  d: 0,
                },
                path: [
                  ["M", cfg.sourceNode.getBBox().maxX, startPoint.y],
                  [
                    "L",
                    (cfg.sourceNode.getBBox().maxX +
                      cfg.targetNode.getBBox().x) /
                      2,
                    startPoint.y,
                  ],
                  [
                    "L",
                    (cfg.sourceNode.getBBox().maxX +
                      cfg.targetNode.getBBox().x) /
                      2,
                    endPoint.y,
                  ],
                  ["L", endPoint.x, endPoint.y],
                ],
              },
            });
            return shape;
          } else {
            let shape = group.addShape("path", {
              attrs: {
                stroke: labelColors[cfg.sourceNode.getModel().name]
                  ? labelColors[cfg.sourceNode.getModel().name]
                  : "#1776FF",
                endArrow: {
                  path: "",
                  d: 0,
                },
                path: [
                  ["M", cfg.sourceNode.getBBox().x, startPoint.y],
                  [
                    "L",
                    (cfg.sourceNode.getBBox().x +
                      cfg.targetNode.getBBox().maxX) /
                      2,
                    startPoint.y,
                  ],
                  [
                    "L",
                    (cfg.sourceNode.getBBox().x +
                      cfg.targetNode.getBBox().maxX) /
                      2,
                    endPoint.y,
                  ],
                  ["L", endPoint.x, endPoint.y],
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
        radius: 2,
        lineWidth: 1,
      };

      const defaultEdgeStyle = {
        stroke: "#E3E6EB",
        endArrow: {
          path: "M 0,0 L 0, -3 L -9,0 L 0, 3 Z",
          fill: "#1776FF",
          stroke: "#1776FF",
          d: -40,
        },
        reverseArrow: {
          path: "M 0,0 L 0, -3 L 9,0 L 0, 3 Z",
          fill: "#1776FF",
          stroke: "#1776FF",
          d: -50,
        },
      };

      const defaultLayout = {
        type: "compactBox",
        direction: "H", //V 垂直分布  H 水平分布
        getId: function getId(d) {
          return d.id;
        },
        getVGap: function getVGap() {
          return 1;
        },
        getHGap: function getHGap(d) {
          if (d.nodeType === "label" && d.showDirection === "in") {
            return 87; // 定1
          } else if (d.nodeType === "label" && d.showDirection === "out") {
            return 26; // 定2
          } else if (d.nodeType !== "label" && d.showDirection === "in") {
            return 180; // 定2
          } else if (d.nodeType !== "label" && d.showDirection === "out") {
            return 251; // 定
          } else {
            return 127; // 定1
          }
          // return 80;
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
          type: "text-node",
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
        if (model.nodeType === "enterprise") {
          getNodeDetail(model.keyNo, tooltip, e);
        }
      });

      graph.on("node:click", handleClickNode);
      graph.on("node:touchend", handleClickNode);

      graph.node((node) => {
        if (node.isTop) {
          return {
            ...node,
            type: "first-node",
          };
        } else if (node.nodeType === "label") {
          return {
            ...node,
            type: "label-node",
          };
        } else {
          return { ...node };
        }
      });

      graph.data(graphData);
      graph.render();
      // graph.fitCenter();
      graph.focusItem(id.value);

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
      console.log("model", model, target, targetType, evt);
      const leftRightType = model.showDirection; // in / out
      const nodeType = model.nodeType; // enterprise person
      const realDepth = model.depth / 2;
      if (targetType === "marker" && realDepth < maxDepth.value) {
        if (target.attr("symbol") === EXPAND_ICON) {
          //判断点击为'+'号--展开
          let result = [];
          if (model.copyChildren.length) {
            result = model.copyChildren;
          } else {
            const loading = message.loading("正在查询", 0);
            if (nodeType === "enterprise") {
              const res1 = await getEnterpriseGraphIn(
                model.keyNo,
                leftRightType,
                false
              );
              const res2 = await getEnterpriseGraphOut(
                model.keyNo,
                leftRightType,
                false
              );
              result = [...res1, ...res2];
            } else if (nodeType === "label") {
              result = model.copyChildren;
            } else {
              result = await getPersonGraph(model.keyNo, leftRightType, false);
            }
            loading();
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
      } else if (targetType === "marker" && realDepth >= maxDepth.value) {
        message.info("当前已达到最大层级！");
      }
    };

    const getTreeData = async (id) => {
      graphData.id = id;
      graphData.keyNo = id;
      graphData.children = [];
      graphData.name = name.value;
      graphData.nodeType = "enterprise";
      const res1 = await getEnterpriseGraphIn(id);
      const res2 = await getEnterpriseGraphOut(id);
      graphData.children = [...graphData.children, ...res1, ...res2];
      console.log("graphData", graphData);
      searchLoading.value = true;
      initGraph(graphDom.value);
      searchLoading.value = false;
    };

    const getEnterpriseGraphIn = async (id, direction, collapsed) => {
      const result = [];
      const res = await enterpriseGraphIn(id);
      if (res.message === "Success") {
        if (res.data.childList && res.data.childList.length) {
          res.data.childList.map((item) => {
            result.push({
              keyNo: item.keyNo,
              id: nanoid(), // 此处为label，没有返回keyNo，故使用自动生成的id
              name: item.name,
              showDirection: direction
                ? direction
                : leftLabels.indexOf(item.name) > -1
                ? "in"
                : "out",
              hasChildren: true,
              collapsed: collapsed
                ? collapsed
                : item.childList && item.childList.length
                ? false
                : true,
              nodeType: "label",
              arrowDirection: "in",
              copyChildren: [],
              children:
                item.childList && item.childList.length
                  ? item.childList.map((child) => {
                      return {
                        keyNo: child.keyNo,
                        id: nanoid(),
                        name: child.name,
                        parentLabel: item.name,
                        money: child.investRatio
                          ? (child.investRatio * 100).toFixed(2)
                          : null,
                        post: child.position,
                        showDirection: direction
                          ? direction
                          : leftLabels.indexOf(item.name) > -1
                          ? "in"
                          : "out",
                        hasChildren: true,
                        nodeType: child.label,
                        copyChildren: [],
                      };
                    })
                  : [],
            });
          });
        } else {
          message.info("暂无数据");
        }
      } else {
        message.error(res.message);
      }
      return result;
    };

    const getEnterpriseGraphOut = async (id, direction, collapsed) => {
      const result = [];
      const res = await enterpriseGraphOut(id);
      if (res.message === "Success") {
        if (res.data.childList && res.data.childList.length) {
          res.data.childList.map((item) => {
            result.push({
              keyNo: item.keyNo,
              id: nanoid(),
              name: item.name,
              showDirection: direction
                ? direction
                : leftLabels.indexOf(item.name) > -1
                ? "in"
                : "out",
              hasChildren: true,
              collapsed: collapsed
                ? collapsed
                : item.childList && item.childList.length
                ? false
                : true,
              nodeType: "label",
              arrowDirection: "out",
              copyChildren: [],
              children:
                item.childList && item.childList.length
                  ? item.childList.map((child) => {
                      return {
                        keyNo: child.keyNo,
                        id: nanoid(),
                        name: child.name,
                        parentLabel: item.name,
                        money: child.investRatio
                          ? (child.investRatio * 100).toFixed(2)
                          : null,
                        post: child.position,
                        showDirection: direction
                          ? direction
                          : leftLabels.indexOf(item.name) > -1
                          ? "in"
                          : "out",
                        hasChildren: true,
                        nodeType: child.label,
                        copyChildren: [],
                      };
                    })
                  : [],
            });
          });
        } else {
          message.info("暂无数据");
        }
      } else {
        message.error(res.message);
      }
      return result;
    };

    const getPersonGraph = async (id, direction, collapsed) => {
      const result = [];
      const res = await personGraph(id);
      if (res.message === "Success") {
        if (res.data.childList && res.data.childList.length) {
          res.data.childList.map((item) => {
            result.push({
              keyNo: item.keyNo,
              id: nanoid(),
              name: item.name,
              showDirection: direction
                ? direction
                : leftLabels.indexOf(item.name) > -1
                ? "in"
                : "out",
              hasChildren: true,
              collapsed: collapsed
                ? collapsed
                : item.childList && item.childList.length
                ? false
                : true,
              nodeType: "label",
              arrowDirection: leftLabels.indexOf(item.name) > -1 ? "in" : "out",
              copyChildren: [],
              children:
                item.childList && item.childList.length
                  ? item.childList.map((child) => {
                      return {
                        keyNo: child.keyNo,
                        id: nanoid(),
                        name: child.name,
                        parentLabel: item.name,
                        money: child.investRatio
                          ? (child.investRatio * 100).toFixed(2)
                          : null,
                        post: child.position,
                        showDirection: direction
                          ? direction
                          : leftLabels.indexOf(item.name) > -1
                          ? "in"
                          : "out",
                        hasChildren: true,
                        nodeType: child.label,
                        copyChildren: [],
                      };
                    })
                  : [],
            });
          });
        } else {
          message.info("暂无数据");
        }
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
.enterprise-graph {
  width: 100%;
  height: 100%;
}
</style>
