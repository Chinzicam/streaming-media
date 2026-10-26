/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.js";

declare interface Window {
  Config: {
    Host: string;
    Port: number;
    UseSSL: boolean;
    SMHost: string;
    SMPort: number;
    Debug?: boolean;
    UnUseSafeURL?: boolean;
    DevSuffix?: boolean;
    Timeout?: number;
    FormalUseSSL?: boolean;
    FormalHost?: string;
    FormalPort?: string;
  };
  JessibucaPro: any;
}
