import request from './request'

export const getComments = (articleId) => request.get(`/api/comments/${articleId}`)
export const createComment = (data) => request.post('/api/comments', data)
