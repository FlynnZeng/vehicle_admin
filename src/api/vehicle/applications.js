import request from '@/utils/request'

// 查询车辆申请列表
export function listApplications(query) {
  return request({
    url: '/vehicle/applications/list',
    method: 'get',
    params: query
  })
}

// 查询车辆申请详细
export function getApplications(id) {
  return request({
    url: '/vehicle/applications/' + id,
    method: 'get'
  })
}

// 新增车辆申请
export function addApplications(data) {
  return request({
    url: '/vehicle/applications',
    method: 'post',
    data: data
  })
}

// 修改车辆申请
export function updateApplications(data) {
  return request({
    url: '/vehicle/applications/update',
    method: 'post',
    data: data
  })
}

// 删除车辆申请
export function delApplications(id) {
  return request({
    url: '/vehicle/applications/' + id,
    method: 'delete'
  })
}
