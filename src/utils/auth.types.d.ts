export type TokenId = string;
export type RefreshTokenId = string;

export interface IUser {
  username: string;
}

export interface IToken {
  token: TokenId;
}

export interface ITokenData extends IToken {
  user: IUser;
  refreshToken: RefreshTokenId;
  expiresIn: number;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse extends ITokenData {}

export interface IRefreshTokenRequest {
  username: string;
  refreshToken: RefreshTokenId;
}

export interface IRefreshTokenResponse extends IToken {}
