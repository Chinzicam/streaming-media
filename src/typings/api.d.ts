interface Window {
  requestAdjust: any;
}

// 返回res.data的interface
interface IResponse<T = any> {
  Result: boolean;
  Data: T;
  Datas: [T];
  ErrCode: number | string;
  Info: [string];
  PageCount: string | number;
  PageIndex: string | number;
  PageSize: string | number;
  RowsCount: string | number;
}

declare namespace Api {
  interface Captcha {
    ID: string;
    Value: string;
  }
  interface Login {
    Estate: number;
    ID: string;
    Name: string;
    NickName: string;
    Phone: string;
  }
  interface Dept {
    Children?: Dept[] | [];
    Dept: Dept;
    Belongs?: string;
    ParentID?: string;
    Category: string;
    Estate: 0 | 1;
    ID: string;
    Level: number;
    Name: string;
    Pinyin?: string;
    PinyinInitial?: string;
  }
  interface GetDeptTree {
    Count: number;
    Depts: Dept[] | [];
  }
}

export const Window;
export const Api;
export const IResponse;
