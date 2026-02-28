import request from './request'

export const getArticles = (params) => request.get('/api/articles', { params })
export const getArticle = (id) => request.get(`/api/articles/${id}`)
export const createArticle = (data) => request.post('/api/articles', data)
export const updateArticle = (id, data) => request.put(`/api/articles/${id}`, data)
export const deleteArticle = (id) => request.delete(`/api/articles/${id}`)
export const getCategories = () => request.get('/api/categories')
