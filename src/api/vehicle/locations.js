import request from '@/utils/request'

// 查询实时定位列表
export function listLocations(query) {
  return request({
    url: '/vehicle/locations/list',
    method: 'get',
    params: query
  })
}

// 查询实时定位详细
export function getLocations(id) {
  return request({
    url: '/vehicle/locations/' + id,
    method: 'get'
  })
}

// 新增实时定位
export function addLocations(data) {
  return request({
    url: '/vehicle/locations',
    method: 'post',
    data: data
  })
}

// 修改实时定位
export function updateLocations(data) {
  return request({
    url: '/vehicle/locations',
    method: 'put',
    data: data
  })
}

// 删除实时定位
export function delLocations(id) {
  return request({
    url: '/vehicle/locations/' + id,
    method: 'delete'
  })
}
