import api from './client'

// ---- Products ----
export const getProducts = () => api.get('/products').then((r) => r.data)
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data)
export const createProduct = (payload) => api.post('/products', payload).then((r) => r.data)
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// ---- Customers ----
export const getCustomers = () => api.get('/customers').then((r) => r.data)
export const getCustomer = (id) => api.get(`/customers/${id}`).then((r) => r.data)
export const createCustomer = (payload) => api.post('/customers', payload).then((r) => r.data)
export const deleteCustomer = (id) => api.delete(`/customers/${id}`)

// ---- Orders ----
export const getOrders = () => api.get('/orders').then((r) => r.data)
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data)
export const createOrder = (payload) => api.post('/orders', payload).then((r) => r.data)
export const cancelOrder = (id) => api.delete(`/orders/${id}`)

// ---- Dashboard ----
export const getDashboardSummary = () => api.get('/dashboard/summary').then((r) => r.data)
