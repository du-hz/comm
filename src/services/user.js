import request from '@/utils/request';

// 已根据RDC改造
export async function queryCurrent() {
  return request('/api/currentUser', {
    method: 'POST',
  });
}



// TODO 以下框架自带，后续可能废弃
export async function query() {
  return request('/api/users');
}

export async function queryNotices() {
  return request('/api/notices');
}
