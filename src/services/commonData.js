// 所有通用数据如：字典表、公司列表等，都通过这个通用service处理

/**
 * 常用的代码放在这里，供参考使用
 * =============== CBS ===============
 * CB0122 集团内外
 * CC0001 客户/供应商
 * COMM0001 是否有效
 * CD1022 内外贸
 * BOUND 进出口
 * =============== RDC ===============
 * RDC_AGENT_TYPE 代理人的代理工作类型（争议代理、审批代理等）
 * RDC_TASK_TYPE 任务类型：内部任务的类型
 * RDC_TASK_STATUS 内部任务状态
 * RDC_APV_ROLE 审批角色
 * RDC_OPR_TYPE 操作日志的类型
 * RDC_APV_STATUS 内部任务审批状态
 *
 *
 */

import request from '@/utils/request';

// 加载指定的字典表，哪些字典表，取决于参数dictOptions中已经存在的属性
export async function loadDict(dictOptions) {
  const dictNames = Object.getOwnPropertyNames(dictOptions);
  // console.log(dictNames);
  return request('/api/common/dict/batchQuery', {
    method: 'POST',
    data: {
      params: {
        dictNames,
      },
    },
  });
}

/**
 * 查询CBS_B_COMPANY表所有公司信息
 */
export async function loadAllCompanies() {
  return request('/api/common/company/all-company', {
    method: 'POST',
  });
}

// 加载当前登录用户所属公司及其下属公司的数据(只拿RDC上线的)
export async function loadSelfAndSubCompany() {
  return request('/api/common/company/self-sub-rdc', {
    method: 'POST',
  });
}

// 加载当前登录用户所属公司及其下属公司的数据
export async function loadSelfAndSubAllCompany() {
  return request('/api/common/company/self-sub', {
    method: 'POST',
  });
}

// 加载当前登录用户所属公司及其下属公司的数据(只拿RDC上线的)
export async function loadAllRelationCompany() {
  return request('/api/common/company/all-relation-rdc', {
    method: 'POST',
  });
}

// 加载当前登录用户所属公司及其下属公司的数据
export async function loadRelationAllCompany() {
  return request('/api/common/company/all-relation', {
    method: 'POST',
  });
}

// 加载当前登录用户所属公司及其下属公司的数据(只拿RDC上线的)
export async function loadSelf() {
  return request('/api/common/company/self', {
    method: 'POST',
  });
}

/**
 * 当前用户的详细信息
 * @returns {Promise<any>}
 */
export function findCurUserCompanyStaff() {
  return request('/api/common/company/findCurUserCompanyStaff', {
    method: 'POST',
  });
}
