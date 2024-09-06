import { createRouter, createWebHashHistory } from "vue-router";

// const layout = () => import(/* webpackChunkName: "layout" */ "@/layout");
// const affairGraph = () =>
//   import(/* webpackChunkName: "affairGraph" */ "@/views/affairGraph");
import layout from "@/layout";
import relationGraph from "@/views/affairGraph/components/relationGraph";
import enterpriseGraph from "@/views/affairGraph/components/enterpriseGraph";
import stockGraph from "@/views/affairGraph/components/stockGraph";

const routes = [
  {
    path: "/",
    name: "layout",
    component: layout,
    redirect: "relation-graph",
    children: [
      {
        path: "relation-graph",
        name: "relationGraph",
        component: relationGraph,
      },
      {
        path: "enterprise-graph",
        name: "enterpriseGraph",
        component: enterpriseGraph,
      },
      {
        path: "stock-graph",
        name: "stockGraph",
        component: stockGraph,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  base: process.env.NODE_ENV === "production" ? "/industCommGraph/" : "/",
  routes,
});

export default router;
