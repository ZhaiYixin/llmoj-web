<template>
  <el-dialog v-model="visible" title="登录" width="500" :before-close="handleClose">
    <el-form :model="form">
      <el-form-item label="账号" label-width="50">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" label-width="50">
        <el-input v-model="form.password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClear">清空</el-button>
        <el-button type="primary" @click="handleLogin" :loading="isLogingIn">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { axiosInstance } from '@/services/http';
import { ElMessage } from 'element-plus';
import eventBus from '@/services/eventBus';

const visible = ref(false);
const form = reactive({
  username: '',
  password: '',
});
const isLogingIn = ref(false);

let loginPromiseResolve: (() => void) | null = null;

/**
 * 显示登录弹窗，返回一个 Promise，以便等待用户完成登录
 */
const showLoginModal = (): Promise<void> => {
  visible.value = true;

  return new Promise((resolve) => {
    loginPromiseResolve = resolve;
  });
};

/**
 * 点击清空按钮
 */
const handleClear = () => {
  form.username = '';
  form.password = '';
};

/**
 * 点击登录按钮
 */
const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.error('账号和密码不能为空');
    return;
  }

  isLogingIn.value = true;
  try {
    const response = await axiosInstance.post('/accounts/login/', {
      username: form.username,
      password: form.password,
    });
    const token = response.data.token;
    localStorage.setItem('token', token);

    if (loginPromiseResolve) {
      loginPromiseResolve();
      loginPromiseResolve = null;
    }
    eventBus.emit('loginSuccess');

    visible.value = false;
    ElMessage.success('登录成功');
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请检查账号和密码');
  } finally {
    isLogingIn.value = false;
  }
};

/**
 * 点击关闭按钮
 */
const handleClose = (done: () => void) => {
  loginPromiseResolve = null;
  eventBus.emit('loginCancel');

  done()
  ElMessage.info('登录已取消');
}

/**
 * 监听showLoginModal事件
 */
onMounted(() => {
  eventBus.on('showLoginModal', showLoginModal);
});

onUnmounted(() => {
  eventBus.off('showLoginModal', showLoginModal);
});
</script>

<style scoped></style>
