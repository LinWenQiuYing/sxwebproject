import { createStore } from "vuex";

export default createStore({
  state: {
    enterpriseId: "",
    enterpriseName: "",
    depth: 10,
    token: null,
  },
  mutations: {
    setEnterpriseId(state, value) {
      console.log("setEnterpriseId", value);
      state.enterpriseId = value;
    },
    setEnterpriseName(state, value) {
      console.log("setEnterpriseName", value);
      state.enterpriseName = value;
    },
    setDepth(state, value) {
      console.log("setDepth", value);
      state.depth = value;
    },
    setToken(state, value) {
      console.log("setToken", value);
      state.token = value;
    },
  },
  actions: {},
  modules: {},
});
