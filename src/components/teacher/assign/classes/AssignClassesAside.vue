<template>
  <el-scrollbar class="aside">
    <el-menu :default-active="defaultActive">
      <el-sub-menu index="c">
        <template #title>
          <el-icon>
            <location />
          </el-icon>
          <span>班级</span>
        </template>
        <el-menu-item v-for="(c, i) in classes" :key="c.class_group.id" :index="'c-' + c.class_group.id"
          @click="handleClassClick(c)">
          {{ c.class_group.title }}
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { Location } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';

const props = defineProps<{
  classGroupId?: string;
}>();

const emit = defineEmits<{
  (event: 'update:class-group-id', newVal?: string): void;
}>();

const defaultActive = ref();
const classes = ref([]);

const classGroupId = computed({
  get: () => props.classGroupId as string | undefined,
  set: (newVal: string | undefined) => {
    if (props.classGroupId !== newVal)
      emit('update:class-group-id', newVal);
  },
});

const handleClassClick = (c) => {
  classGroupId.value = c.class_group.id;
}

const loadClasses = async () => {
  const url = `/assign/classes/`;
  const response = await axiosInstance.get(url);
  classes.value = response.data;
};

onMounted(() => {
  loadClasses().then(() => {
    if (classGroupId.value) {
      defaultActive.value = 'c-' + classGroupId.value;
    } else if (classes.value.length > 0) {
      classGroupId.value = classes.value[0].class_group.id;
      defaultActive.value = 'c-' + classes.value[0].class_group.id;
    }
  });
});

</script>

<style scoped></style>
