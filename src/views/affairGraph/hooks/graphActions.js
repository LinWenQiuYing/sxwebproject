// 为何多此一举的写下面的方法：因为暴露出去给graphtool组件使用的graph读取不到，不知道为什么，无奈才写的下面的一系列方法
// 刷新
export const refreshGraph = (graph) => {
  graph.refresh();
};

// 重置
export const resetGraph = (graph, graphDom, canvasRatio) => {
  canvasRatio.value = 1;
  const center = {
    x: graphDom.value.clientWidth / 2,
    y: graphDom.value.clientHeight / 2,
  };
  graph.zoomTo(canvasRatio.value, center);
  graph.refresh();
};

// 放大
export const plusGraph = (graph, graphDom, canvasRatio) => {
  console.log("plusGraph", canvasRatio);
  // 如果把canvasRatio放在该js文件中，则多个页面会共用一个canvasRatio，会出问题，故把其作为入参，下面方法里的canvasRatio同理
  const center = {
    x: graphDom.value.clientWidth / 2,
    y: graphDom.value.clientHeight / 2,
  };
  canvasRatio.value *= 1.25;
  canvasRatio.value = canvasRatio.value.toFixed(2); // 保留两位小数，方便变成百分数
  if (canvasRatio.value > 2.4) {
    canvasRatio.value = 2.4;
    return false;
  } else {
    graph.zoomTo(canvasRatio.value, center);
  }
};

// 缩小
export const minusGraph = (graph, graphDom, canvasRatio) => {
  const center = {
    x: graphDom.value.clientWidth / 2,
    y: graphDom.value.clientHeight / 2,
  };
  canvasRatio.value *= 0.8;
  canvasRatio.value = canvasRatio.value.toFixed(2); // 保留两位小数，方便变成百分数
  if (canvasRatio.value < 0.5) {
    canvasRatio.value = 0.5;
    return false;
  } else {
    graph.zoomTo(canvasRatio.value, center);
  }
};