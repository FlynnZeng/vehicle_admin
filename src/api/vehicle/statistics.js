import request from '@/utils/request'

// 查询费用统计列表
export function listStatistics(query) {
  return request({
    url: '/vehicle/statistics/list',
    method: 'get',
    params: query
  })
}

// 查询费用统计详细
export function getStatistics(id) {
  return request({
    url: '/vehicle/statistics/' + id,
    method: 'get'
  })
}

// 新增费用统计
export function addStatistics(data) {
  return request({
    url: '/vehicle/statistics',
    method: 'post',
    data: data
  })
}

// 修改费用统计
export function updateStatistics(data) {
  return request({
    url: '/vehicle/statistics',
    method: 'put',
    data: data
  })
}

// 删除费用统计
export function delStatistics(id) {
  return request({
    url: '/vehicle/statistics/' + id,
    method: 'delete'
  })
}
