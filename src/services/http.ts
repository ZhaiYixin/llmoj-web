import axios from 'axios'
import eventBus from '@/services/eventBus'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加 token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// 响应拦截器：处理 token 无效
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        // 触发登录弹窗事件
        eventBus.emit('showLoginModal')

        // 等待用户完成登录
        await new Promise((resolve, reject) => {
          eventBus.on('loginSuccess', resolve)
          eventBus.on('loginCancel', reject)
        })

        // 登录完成后重新执行原始请求
        return axiosInstance.request(error.config)
      } catch (modalError) {
        // 如果用户取消登录，抛出错误
        return Promise.reject(modalError)
      }
    }
    return Promise.reject(error)
  },
)

export { axiosInstance }
