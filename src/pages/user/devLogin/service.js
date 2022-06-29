import request from '@/utils/request';

export async function login(params) {
  return request('/api/dev-login', {
    method: 'POST',
    data: {
      params,
    },
  });
  // return request('/api/dev-login', {
  //   method: 'POST',
  //   data: {
  //     params,
  //   },
  // });
}
