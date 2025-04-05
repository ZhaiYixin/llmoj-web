<template>
  <div class="wrapper">
    <div class="header">
      <div class="search-wrapper">
        <el-select class="search-filter" v-model="filterOptions" @change="load" multiple placeholder="不限类型" size="large"
          collapse-tags collapse-tags-tooltip>
          <el-option key="public" label="只看公开的" value="public" />
          <el-option key="designed_by_me" label="只看我的" value="designed_by_me" />
          <el-option key="private" label="只看我私密的" value="private" />
        </el-select>
        <el-input class="search-input" v-model="searchInput" @change="load" :prefix-icon="Search" placeholder="搜索题目集"
          size="large" />
      </div>
      <el-button @click="handlePlusButtonClick" :icon="Plus">新建</el-button>
    </div>
    <el-table class="table" :data="tableData" @row-click="handleTableRowClick" row-class-name="table-row">
      <el-table-column type="expand">
        <template #default="scope">
          <el-table :data="scope.row.problems" :border="true">
            <el-table-column prop="title" label="题目" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="updatedAt" label="修改于" show-overflow-tooltip />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="题目集" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="itemCount" label="题目数量" />
      <el-table-column prop="designer" label="组题人" show-overflow-tooltip />
      <el-table-column prop="updatedAt" label="修改于" show-overflow-tooltip />
    </el-table>
    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="currentPage" :total="total" :page-size="pageSize" layout="prev, pager, next"
        hide-on-single-page />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';
import dayjs from 'dayjs';

const pageSize = 30;
const router = useRouter();

const filterOptions = ref([])
const searchInput = ref('')
const currentPage = ref(1);
const total = ref(0);
const tableData = ref<Array<any>>([]);

const handlePlusButtonClick = () => {
  router.push({ name: 'ProblemListCreate' });
}

const handleTableRowClick = (row: any) => {
  router.push({ name: 'ProblemListDetail', params: { id: row.id } });
};

const load = async () => {
  let url = `/design/problem-lists/?page_size=${pageSize}&page=${currentPage.value}`;
  if (searchInput.value)
    url += `&search=${searchInput.value}`;
  for (const option of filterOptions.value) {
    url += `&${option}`;
  }

  const response = await axiosInstance.get(url);

  total.value = response.data.count;
  tableData.value = response.data.results.map((ls: any) => ({
    id: ls.problem_list.id,
    title: ls.problem_list.title,
    description: ls.problem_list.description,
    designer: ls.problem_list.designer.full_name,
    updatedAt: dayjs(ls.problem_list.updated_at).format('YYYY-MM-DD'),
    itemCount: ls.items.length,
    problems: ls.items.map((p: any) => {
      return p.problem ? {
        title: p.problem.title,
        description: p.problem.description,
        updatedAt: dayjs(p.problem.updated_at).format('YYYY-MM-DD'),
      } : {
        title: '题目已删除',
      };
    }),
  }));
}

watch(currentPage, async () => {
  load();
}, { immediate: true })
</script>

<style scoped>
.wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.search-filter {
  width: 12em;
}

.search-input {
  width: 20em;
}

.table {
  width: 100%;
  flex: 1;
}

::v-deep(.table-row) {
  cursor: pointer;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
}
</style>
