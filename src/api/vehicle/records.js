import request from '@/utils/request'

// 查询派车记录列表
export function listRecords(query) {
  return request({
    url: '/vehicle/records/list',
    method: 'get',
    params: query
  })
}

// 查询派车记录详细
export function getRecords(id) {
  return request({
    url: '/vehicle/records/' + id,
    method: 'get'
  })
}

// 新增派车记录
export function addRecords(data) {
  return request({
    url: '/vehicle/records',
    method: 'post',
    data: data
  })
}

// 修改派车记录
export function updateRecords(data) {
  return request({
    url: '/vehicle/records',
    method: 'put',
    data: data
  })
}

// 删除派车记录
export function delRecords(id) {
  return request({
    url: '/vehicle/records/' + id,
    method: 'delete'
  })
}
