import request from '@/utils/request';



export async function loadArgueBaseType(params) {
  return request('/api/base/argue-base-type/query', {
    method: 'POST',
    data: {
      params,
    },
  });
};

export async function loadUserCompany(params) {
  return request('/api/base/user-company/query', {
    method: 'POST',
    data: {
      params,
    },
  });
};

export async function loadAdminCompany(params) {
  return request('/api/base/admin-company/query', {
    method: 'POST',
    data: {
      params,
    },
  });
};
