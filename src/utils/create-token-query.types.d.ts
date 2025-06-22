export interface Config<TToken, TLoginParams> {
  tokenExpired: (token: TToken) => boolean;
  refreshExpired: (token: TToken) => boolean;
  sendLogin: (loginParams: TLoginParams) => Promise<TToken>;
  sendRefresh: (token: TToken) => Promise<TToken>;
  retry: (failCount: number, error: any) => boolean;
  refreshExpiredError: any;
  queryKey?: string;
  shouldRefreshOnBackground?: (token: TToken) => boolean;
}
declare function createTokenQuery<TToken, TLoginParams>({
  queryKey,
  tokenExpired,
  refreshExpired,
  sendLogin,
  sendRefresh,
  retry,
  refreshExpiredError,
  shouldRefreshOnBackground,
}: Config<TToken, TLoginParams>): {
  init: (refreshInterval?: number | undefined) => Promise<void>;
  useLogin: () => {
    data: TToken | null;
    isFetching: boolean;
    error: any;
    requestLogin: (loginParams: TLoginParams, throwOnError?: boolean) => Promise<any>;
  };
  useToken: () => TToken | undefined;
  logout: () => Promise<void>;
  refresh: (throwOnError?: boolean) => Promise<any>;
  getToken: (force?: boolean) => Promise<any>;
};
export default createTokenQuery;
