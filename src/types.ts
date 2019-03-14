export interface INewUser {
  username: string;
  password: string;
}

export interface IUser {
  id: number;
  username: string;
  password: string;
}

export interface IIMAP {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  authTimeout: number;
}

export interface IIMAPConfig {
  imap: IIMAP;
}

export interface IImapConfig {
  host: string;
  port: number;
  secure: boolean;
}

export interface IMailbox {
  name: string;
  email: string;
  username: string;
  password: string;
  lastCheck: Date;
  imapConfig: IImapConfig;
}

export interface IEmail {
  html: string;
  plain: string;
  header: any;
}

export interface IRuleProto {
  type: string; // type of rule
  data: []; // array of keywords, or email addresses
  scope: string; // subject, body or any
  check: {
    // if 'any', the rule passes if any element in data passes.
    // if 'all', the rule passes only if every element in data passes.
    // if 'min', the rule passes only if at least "min" elements in data pass.
    // if 'max', the rule passes only if at mist "max" elements in data pass.
    // if 'none', the rule passes if no element in the data passes.
    // if 'range', the rule passes if between MIN and MAX pass
    type: string;
    min: number | null | undefined;
    max: number | null | undefined;
  };
}

export interface IRule {
  tag: string;
  rules: IRuleProto[];
}
