import axiosInstance from "./index.js";

const relationUrl = "/credit/api/relation";
const baseUrl = "/credit/api/base";
const stockUrl = "/credit/api/shareholding";
const enterpriseUrl = "/credit/api/enterprise";
const userUrl = "/portal/company/product";

// 根据enterprise的id获取enterprise详情
export async function getEnterpriseDetail(id) {
  const res = await axiosInstance.get(
    `${relationUrl}/enterpriseDetail?enterpriseId=${id}`
  );
  return res;
}

// 根据person的id获取person详情
export async function getPersonDetail() {
  const res = await axiosInstance.get(`${relationUrl}/personDetail`);
  return res;
}

// 根据企业或人获得关系图谱
export async function getRelationGraph(json) {
  const res = await axiosInstance.post(`${relationUrl}/relationGraph`, json, {
    timeout: -1,
  });
  return res;
}

// 获取当前公司的投资公司
export async function getInvest(json) {
  const res = await axiosInstance.post(`${stockUrl}/invest`, json, {
    timeout: -1,
  });
  return res;
}

// 获取当前公司的所有者
export async function getOwnership(json) {
  const res = await axiosInstance.post(`${stockUrl}/ownership`, json, {
    timeout: -1,
  });
  return res;
}

// 根据enterprise的id获取相关展开信息(方向向内)
export async function enterpriseGraphIn(id) {
  const res = await axiosInstance.get(
    `${enterpriseUrl}/enterpriseGraphIn?enterpriseId=${id}`
  );
  return res;
}

// 根据enterprise的id获取相关展开信息(方向向外)
export async function enterpriseGraphOut(id) {
  const res = await axiosInstance.get(
    `${enterpriseUrl}/enterpriseGraphOut?enterpriseId=${id}`
  );
  return res;
}

// 根据person的id获取相关展开信息
export async function personGraph(id) {
  const res = await axiosInstance.get(
    `${enterpriseUrl}/personGraph?personId=${id}`
  );
  return res;
}

// 模糊搜索企业名称
export async function search(name) {
  const res = await axiosInstance.get(`${baseUrl}/search?name=${name}`);
  return res;
}

// 校验token
export async function checkToken(token) {
  const res = await axiosInstance.get(`${userUrl}/checkToken?token=${token}`);
  return res;
}
