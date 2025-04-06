import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { axiosInstance } from '@/services/http'
import type { Reactive } from 'vue'

export const useUserStore = defineStore('user', () => {
  interface Info {
    username: string
    full_name: string
  }

  const defaultInfo: Info = {
    username: '',
    full_name: '',
  } as const

  const info: Reactive<Info> = reactive(
    JSON.parse(localStorage.getItem('userInfo') || JSON.stringify(defaultInfo)),
  )

  const fetchInfo = async () => {
    try {
      const response = await axiosInstance.get('/accounts/user-info/')
      setInfo(response.data)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const getInfo = async () => {
    if (!info.username) {
      await fetchInfo()
    }
    return info
  }

  const setInfo = (newVal: Info) => {
    Object.assign(info, newVal)
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const clearInfo = () => {
    Object.assign(info, defaultInfo)
    localStorage.removeItem('userInfo')
  }

  return { info, fetchInfo, getInfo, setInfo, clearInfo }
})
