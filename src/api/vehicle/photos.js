import request from '@/utils/request'

// 查询车辆照片列表
export function listPhotos(query) {
  return request({
    url: '/vehicle/photos/list',
    method: 'get',
    params: query
  })
}

// 查询车辆照片详细
export function getPhotos(id) {
  return request({
    url: '/vehicle/photos/' + id,
    method: 'get'
  })
}

// 新增车辆照片
export function addPhotos(data) {
  return request({
    url: '/vehicle/photos',
    method: 'post',
    data: data
  })
}

// 修改车辆照片
export function updatePhotos(data) {
  return request({
    url: '/vehicle/photos',
    method: 'put',
    data: data
  })
}

// 删除车辆照片
export function delPhotos(id) {
  return request({
    url: '/vehicle/photos/' + id,
    method: 'delete'
  })
}
