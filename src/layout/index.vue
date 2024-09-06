<template>
  <a-layout class="layout">
    <!-- <a-layout-header class="layout-header">
      <div class="layout-header-title">
        <img
          src="@/assets/images/img/header-title.svg"
          alt="陕西征信应用系统"
        />
      </div>
      <div class="layout-header-user">admin</div>
    </a-layout-header> -->
    <a-layout-content class="layout-content">
      <div class="affair-graph">
        <!-- <div class="affair-graph-top">
          <a-auto-complete
            allowClear
            placeholder="请输入查询名称"
            v-model:value.trim="inputValue"
            :filter-option="false"
            @change="handleSelect"
            class="search-input"
            :backfill="false"
            :options="dataSource"
            @compositionstart="handleComposition"
            @compositionend="handleComposition"
          />
          <a-button type="primary" @click="handleSearch" :loading="searchLoading">
            <template #icon>
              <SearchOutlined />
            </template>
            搜索
          </a-button>
        </div> -->
        <div class="affair-graph-content">
          <!-- <div class="affair-graph-content-left">
            <div class="left-header">图谱列表</div>
            <div class="left-menu">
              <div
                :class="['left-menu-item', selectedIndex === index ? 'active' : '']"
                v-for="(item, index) in menuList"
                :key="index"
                @click="handleClickMenu(index)"
              >
                <img :src="item.src" :alt="item.title" />
                <span>{{ item.title }}</span>
              </div>
            </div>
          </div> -->
          <div class="affair-graph-content-main">
            <div
              class="main-watermarker"
              :style="{
                fontSize: '20px',
                background: `url(${backgroundUrl}) repeat`,
                backgroundSize: '360px 280px',
              }"
            ></div>
            <div class="main-content">
              <!-- <a-breadcrumb
                separator=">"
                v-if="searchValue"
                class="main-breadcrumb"
              >
                <a-breadcrumb-item>{{ searchValue }}</a-breadcrumb-item>
                <a-breadcrumb-item>{{
                  menuList[selectedIndex].title
                }}</a-breadcrumb-item>
              </a-breadcrumb> -->
              <router-view />
            </div>
          </div>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>
<script>
import { Layout, message } from "ant-design-vue";
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { checkToken } from "@/shared/api/affairGraph";

const { Header, Content } = Layout;
export default {
  name: "Layout",
  setup() {
    const store = useStore();
    const route = useRoute(); // 路由对象
    const id = ref(store.state.enterpriseId); // 搜索的企业id 91610000719779238R 陕西广电融媒体集团有限公司
    const token = ref(route.query.token || "");
    store.commit("setToken", route.query.token || "");

    const getEnterpriseInfo = async (token) => {
      const res = await checkToken(token);
      if (res.msg === "操作成功") {
        store.commit("setEnterpriseId", res.data.code);
        store.commit("setEnterpriseName", res.data.companyName);
        store.commit("setDepth", res.data.depth);
      } else {
        message.error(res.msg);
      }
    };

    const backgroundUrl = require("@/assets/images/img/logo.svg");
    console.log("backgroundUrl", backgroundUrl);
    onMounted(async () => {
      await getEnterpriseInfo(token.value);
    });
    return {
      id,
      backgroundUrl,
    };
  },
  components: {
    ALayout: Layout,
    ALayoutHeader: Header,
    ALayoutContent: Content,
  },
};
</script>
<style lang="less">
.layout {
  height: 100%;

  &-header {
    height: 48px;
    display: flex;
    padding: 0 16px;
    align-items: center;
    background: #003eb3;
    justify-content: space-between;

    &-title {
      width: 192px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &-user {
      height: 24px;
      color: #fff;
      line-height: 24px;
    }
  }

  &-content {
    padding: 16px;
    background: #f5f5f5;
    height: 100%;

    .main-spin {
      top: 50%;
      left: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
    }

    .affair-graph {
      width: 100%;
      height: 100%;

      &-top {
        height: 64px;
        display: flex;
        align-items: center;

        .search-input {
          width: 320px;
          border-radius: 4px 0px 0px 4px;
        }

        .ant-btn {
          border: 0;
          width: 89px;
          outline: none;
          background: #1776ff;
          border-radius: 0px 4px 4px 0px;
        }
      }

      &-content {
        display: flex;
        height: 100%;
        background: url("../assets/images/img/logo.svg") repeat;
        background-size: 360px 280px;

        &-left {
          width: 232px;
          padding: 16px;
          border-radius: 6px;
          background: #fff;
          margin-right: 16px;
          overflow-y: auto;
          box-shadow: 0px 2px 8px rgba(31, 48, 78, 0.05),
            0px 10px 16px 4px rgba(31, 48, 78, 0.04);

          .left-header {
            height: 22px;
            line-height: 22px;
            color: #3c485c;
            margin-bottom: 16px;
          }

          .left-menu {
            &-item {
              cursor: pointer;
              margin-bottom: 24px;
              text-align: center;
              user-select: none;

              &:not(:last-child) {
                margin-bottom: 24px;
              }

              img {
                width: 100%;
                height: 100%;
                border-radius: 6px;
              }

              span {
                color: #3c485c;
                margin-top: 8px;
              }

              &.active {
                img {
                  border: 1px solid #1776ff;
                }

                span {
                  color: #1776ff;
                }
              }
            }
          }
        }

        &-main {
          // padding: 16px;
          background: #fff;
          border-radius: 6px;
          position: relative;
          width: 100%;
          box-shadow: 0px 2px 8px rgba(31, 48, 78, 0.05),
            0px 10px 16px 4px rgba(31, 48, 78, 0.04);

          .main-watermarker {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            line-height: 1.2;
            opacity: 0.1;
            z-index: 0;
          }

          .main-content {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            z-index: 1;
          }

          .main-breadcrumb {
            z-index: -1;
            top: 16px;
            left: 16px;
            user-select: none;
            position: absolute;
            color: #3c485c !important;

            &-separator {
              color: #3c485c !important;
            }
          }

          .main-spin {
            top: 50%;
            left: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
          }
        }
      }
    }
  }
}
</style>
