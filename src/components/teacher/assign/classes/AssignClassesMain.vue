<template>
  <div class="wrapper">
    <div class="header">
      <div class="search-wrapper">
        <el-select class="search-order" v-model="orderOption" @change="load" placeholder="默认排序" size="large">
          <el-option key="-created_at" label="最晚创建" value="-created_at" />
          <el-option key="-release_date" label="最晚开始" value="-release_date" />
          <el-option key="-due_date" label="最晚结束" value="-due_date" />
        </el-select>
        <el-select class="search-filter" v-model="filterOptions" @change="load" multiple placeholder="不限类型" size="large"
          collapse-tags collapse-tags-tooltip>
          <el-option key="not_due" label="未结束" value="not_due" />
          <el-option key="not_release" label="未开始" value="not_release" />
        </el-select>
        <el-input class="search-input" v-model="searchInput" @change="load" :prefix-icon="Search" placeholder="搜索题目集"
          size="large" />
      </div>
      <el-button @click="handlePlusButtonClick" :icon="Plus">新建</el-button>
    </div>
    <el-table class="table" :data="tableData">
      <el-table-column prop="title" label="任务" show-overflow-tooltip :width="200" />
      <!-- <el-table-column prop="created_at" label="创建于" show-overflow-tooltip /> -->
      <el-table-column prop="release_date" label="开始时间" show-overflow-tooltip />
      <el-table-column prop="due_date" label="结束时间" show-overflow-tooltip />
      <el-table-column prop="homeworks_count" label="已开始" />
      <el-table-column prop="completed_count" label="已完成" />
      <el-table-column>
        <template #default="scope">
          <el-button-group>
            <el-button size="small" text :icon="Link" @click="handleDetail(scope.$index, scope.row)" />
            <el-button size="small" text :icon="Edit" @click="handleEdit(scope.$index, scope.row)" />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search, Plus, Link, Edit } from '@element-plus/icons-vue';
import type { TableInstance } from 'element-plus'
import { axiosInstance } from '@/services/http';
import dayjs from 'dayjs';

const props = defineProps<{
  classGroupId?: string;
}>();

const emit = defineEmits<{
  (event: 'plus-button-click'): void;
  (event: 'detail-button-click', row: any): void;
  (event: 'edit-button-click', row: any): void;
}>();

const orderOption = ref('');
const filterOptions = ref<Array<string>>([]);
const searchInput = ref('');
const tableData = ref<Array<any>>([]);
const tableRef = ref<TableInstance>();

const handlePlusButtonClick = () => {
  emit('plus-button-click');
}

const handleDetail = (index, row) => {
  emit('detail-button-click', row.id);
};

const handleEdit = (index, row) => {
  emit('edit-button-click', row.id);
};

const load = async () => {
  let url = `/assign/assignments/?`;
  if (props.classGroupId)
    url += `&class_group_id=${props.classGroupId}`;

  const response = await axiosInstance.get(url);

  let rows = response.data.map((a: any) => ({
    id: a.assignment.id,
    title: a.assignment.problem_list.title,
    release_date: dayjs(a.assignment.release_date).format('YYYY-MM-DD'),
    due_date: dayjs(a.assignment.due_date).format('YYYY-MM-DD'),
    created_at: dayjs(a.assignment.created_at).format('YYYY-MM-DD'),
    homeworks_count: a.homeworks_count,
    completed_count: a.completed_count,
  })) as Array<any>;

  const today = dayjs().format('YYYY-MM-DD');
  if (filterOptions.value.includes('not_due'))
    rows = rows.filter((r, i) => (today <= r.due_date));
  if (filterOptions.value.includes('not_release'))
    rows = rows.filter((r, i) => (today <= r.release_date));

  if (orderOption.value.endsWith('created_at'))
    rows.sort((a, b) => (a.created_at).localeCompare(b.created_at));
  if (orderOption.value.endsWith('release_date'))
    rows.sort((a, b) => (a.release_date).localeCompare(b.release_date));
  if (orderOption.value.endsWith('due_date'))
    rows.sort((a, b) => (a.due_date).localeCompare(b.due_date));
  if (orderOption.value.startsWith('-'))
    rows.reverse();

  tableData.value = rows;
}

watch(() => props.classGroupId, async () => {
  if (props.classGroupId) {
    load();
  }
}, { immediate: true });
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

.search-order {
  width: 8em;
}

.search-filter {
  width: 8em;
}

.search-input {
  width: 20em;
}

.table {
  width: 100%;
  flex: 1;
}
</style>
