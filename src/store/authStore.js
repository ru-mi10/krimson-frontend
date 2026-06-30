// src/store/authStore.js
import { create } from 'zustand'
import client from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('krimson_token') || null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('krimson_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('krimson_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    try {
      const token = localStorage.getItem('krimson_token')
      if (!token) return set({ isLoading: false })
      const { data } = await client.get('/auth/me')
      set({ user: data.user, isLoading: false })
    } catch {
      localStorage.removeItem('krimson_token')
      set({ user: null, token: null, isLoading: false })
    }
  },
}))

export default useAuthStore