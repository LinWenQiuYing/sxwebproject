import G6 from "@antv/g6";
import { getEnterpriseDetail, getPersonDetail } from "@/shared/api/affairGraph";
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";

let detailData = reactive({}); // 悬浮查看的企业详情信息
let isTooltipShow = ref(false); // tooltip是否展示

// tooltip
export default function () {
  // tooltip提示框
  const tooltip = new G6.Tooltip({
    offsetX: 30,
    offsetY: 30,
    // the types of items that allow the tooltip show up
    // 允许出现 tooltip 的 item 类型
    // itemTypes: ["node", "edge"],
    itemTypes: ["node"],
    // 是否固定出现在相对于目标节点的某个位置，鼠标在节点上方移动时不实时更新。false 代表不固定，[number, number] 类型的值用于指定固定位置，例如 [1, 0.5] 代表 tooltip 的左上角固定到目标节点的正右方（数组代表的类似 Anchor Point 的位置定义）。仅在节点上生效
    // fixToNode: [1, 0],
    // custom the tooltip's content
    // 自定义 tooltip 内容
    getContent: (e) => {
      const outDiv = document.createElement("div");
      outDiv.style.width = "fit-content";
      outDiv.style.padding = "8px";
      /* 
        下方代码说明，原本使用加号拼接html，但实际会出问题，不明原因，时间紧迫，出此下策，日后可花时间研究
      */
      if (detailData.stateOwn && detailData.scaleEnter) {
        outDiv.innerHTML = `
        <div>
          <p style="font-size: 16px; color: #3C485C; line-height: 22px; margin-bottom: 4px;">${detailData.name}</p>
          <div style="display: flex; align-items: center; margin-bottom: 12px; height: 20px;">
            <div class="tags-status" style="font-size: 12px; color: #1BB46D; text-align: center; border: 1px solid #1BB46D; background-color: #E6F5EB; border-radius: 4px; width: 34px; height: 100%; line-height: 20px; margin-right: 4px;">${detailData.status}</div>
            <div class="tags-status" style="font-size: 12px; color: #2A43C2; text-align: center; background-color: #F0F5FF; border-radius: 4px; width: 58px; height: 100%; line-height: 20px; margin-right: 4px;">国有企业</div>
            <div class="tags-status" style="font-size: 12px; color: #2A43C2; text-align: center; background-color: #F0F5FF; border-radius: 4px; width: 58px; height: 100%; line-height: 20px; margin-right: 4px;">${detailData.scaleEnter}企业</div>
          </div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">法人代表：<span style="margin-left: 8px; color: #1776FF;">${detailData.legalPerson}</span></div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">注册资本：<span style="margin-left: 8px; color: #3C485C;">${detailData.registryMoney}</span></div>
          <div style="color: #97A3B7; font-size: 14px;">成立日期：<span style="margin-left: 8px; color: #3C485C;">${detailData.date}</span></div>
        </div>`;
      } else if (detailData.stateOwn) {
        outDiv.innerHTML = `
        <div>
          <p style="font-size: 16px; color: #3C485C; line-height: 22px; margin-bottom: 4px;">${detailData.name}</p>
          <div style="display: flex; align-items: center; margin-bottom: 12px; height: 20px;">
            <div class="tags-status" style="font-size: 12px; color: #1BB46D; text-align: center; border: 1px solid #1BB46D; background-color: #E6F5EB; border-radius: 4px; width: 34px; height: 100%; line-height: 20px; margin-right: 4px;">${detailData.status}</div>
            <div class="tags-status" style="font-size: 12px; color: #2A43C2; text-align: center; background-color: #F0F5FF; border-radius: 4px; width: 58px; height: 100%; line-height: 20px; margin-right: 4px;">国有企业</div>
          </div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">法人代表：<span style="margin-left: 8px; color: #1776FF;">${detailData.legalPerson}</span></div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">注册资本：<span style="margin-left: 8px; color: #3C485C;">${detailData.registryMoney}</span></div>
          <div style="color: #97A3B7; font-size: 14px;">成立日期：<span style="margin-left: 8px; color: #3C485C;">${detailData.date}</span></div>
        </div>`;
      } else if (detailData.scaleEnter) {
        outDiv.innerHTML = `
        <div>
          <p style="font-size: 16px; color: #3C485C; line-height: 22px; margin-bottom: 4px;">${detailData.name}</p>
          <div style="display: flex; align-items: center; margin-bottom: 12px; height: 20px;">
            <div class="tags-status" style="font-size: 12px; color: #1BB46D; text-align: center; border: 1px solid #1BB46D; background-color: #E6F5EB; border-radius: 4px; width: 34px; height: 100%; line-height: 20px; margin-right: 4px;">${detailData.status}</div>
            <div class="tags-status" style="font-size: 12px; color: #2A43C2; text-align: center; background-color: #F0F5FF; border-radius: 4px; width: 58px; height: 100%; line-height: 20px; margin-right: 4px;">${detailData.scaleEnter}企业</div>
          </div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">法人代表：<span style="margin-left: 8px; color: #1776FF;">${detailData.legalPerson}</span></div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">注册资本：<span style="margin-left: 8px; color: #3C485C;">${detailData.registryMoney}</span></div>
          <div style="color: #97A3B7; font-size: 14px;">成立日期：<span style="margin-left: 8px; color: #3C485C;">${detailData.date}</span></div>
        </div>`;
      } else {
        outDiv.innerHTML = `
        <div>
          <p style="font-size: 16px; color: #3C485C; line-height: 22px; margin-bottom: 4px;">${detailData.name}</p>
          <div style="display: flex; align-items: center; margin-bottom: 12px; height: 20px;">
            <div class="tags-status" style="font-size: 12px; color: #1BB46D; text-align: center; border: 1px solid #1BB46D; background-color: #E6F5EB; border-radius: 4px; width: 34px; height: 100%; line-height: 20px; margin-right: 4px;">${detailData.status}</div>
          </div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">法人代表：<span style="margin-left: 8px; color: #1776FF;">${detailData.legalPerson}</span></div>
          <div style="color: #97A3B7; font-size: 14px; margin-bottom: 4px;">注册资本：<span style="margin-left: 8px; color: #3C485C;">${detailData.registryMoney}</span></div>
          <div style="color: #97A3B7; font-size: 14px;">成立日期：<span style="margin-left: 8px; color: #3C485C;">${detailData.date}</span></div>
        </div>`;
      }
      return outDiv;
    },
    shouldBegin: (e) => {
      // return true;
      const model = e.item.getModel();
      // console.log(
      //   "shouldBegin",
      //   model.nodeType,
      //   detailData.id,
      //   model.keyNo,
      //   JSON.stringify(detailData) === "{}",
      //   detailData.id !== model.keyNo,
      //   isTooltipShow.value
      // );
      if (
        model.nodeType !== "enterprise" ||
        JSON.stringify(detailData) === "{}" ||
        detailData.id !== model.keyNo
      ) {
        return false;
      } else {
        return isTooltipShow.value;
      }
    },
  });

  return tooltip;
}

// 获取节点详情数据
export const getNodeDetail = async (id, tooltip, e) => {
  // enterpriseId: "916100006949266167";
  // enterpriseName: "陕西中广传播有限公司";
  // establishTime: "2009/10/15";
  // legalPerson: "孙朝晖";
  // nameBefore: "";
  // registryMoney: "2000";
  // status: "开业";
  isTooltipShow.value = false;
  const res = await getEnterpriseDetail(id);
  if (res.message === "Success") {
    detailData = {
      id: res.data.enterpriseId,
      name: res.data.enterpriseName,
      date: res.data.establishTime || "--",
      legalPerson: res.data.legalPerson || "--",
      registryMoney: res.data.registryMoney
        ? res.data.registryMoney + "万人民币"
        : "--",
      status: res.data.status,
      stateOwn: res.data.stateOwn === 1 ? true : false,
      scaleEnter: res.data.scaleEnter,
    };
    isTooltipShow.value = true;
    tooltip.showTooltip(e); // tooltip会在接口获取到数据后停止调用shouldBegin，不知道原因，只能手动再调一次
  } else {
    detailData = {};
    isTooltipShow.value = false;
    message.error(res.message);
  }
};