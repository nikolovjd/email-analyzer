import { injectable } from 'inversify';
import { IEmail, IRule } from '../types';
import franc from 'franc';
import snowball = require('node-snowball');
import htmlToText from 'html-to-text';

function toElementCountMap(arr: []) {
  const res: any = {};
  for (const element of arr) {
    if (!res[element]) {
      res[element] = 1;
    } else {
      res[element]++;
    }
  }
  return new Map(Object.entries(res));
}

// exact-keyword
// keyword
// sender
// cc
// language

const languages = {
  hun: 'hungarian',
  eng: 'english'
};

@injectable()
class EmailAnalyzerService {
  public analyzeEmail(email: IEmail, rules: IRule[]) {
    const tags = [];
    for (const rule of rules) {
      if (this.checkRule(email, rule)) {
        tags.push(rule.tag);
      }
    }

    return tags;
  }

  public test() {
    console.log('HERE');
  }

  private checkRule(email: IEmail, rule: IRule): boolean {
    for (const ruleProto of rule.rules) {
      switch (ruleProto.type) {
        case 'exact-keyword':
          if (!this.exactKeyword(email, ruleProto.data, ruleProto.check)) {
            return false;
          }
          break;
        case 'keyword':
          if (!this.keyword(email, ruleProto.data, ruleProto.check)) {
            return false;
          }
          break;
        case 'sender':
          if (!this.sender(email, ruleProto.data, ruleProto.check)) {
            return false;
          }
          break;
        case 'cc':
          if (!this.cc(email, ruleProto.data, ruleProto.check)) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  private keyword(email: IEmail, keywords: string[], check: any) {
    const words = toElementCountMap(
      snowball.stemword(
        htmlToText
          .fromString(email.html)
          .toLowerCase()
          .replace(/[.,\/|+#<@\[\]0123456789>!?"'$%\^&\*;:{}=\-_`~()]/g, ' ')
          .split(/(\s+)/)
          .map(word => word.trim())
          .filter(word => word.length),
        'hungarian'
      )
    );

    const kws = snowball.stemword(keywords, 'hungarian');

    switch (check.type) {
      case 'any': {
        for (const kw of kws) {
          if (words.has(kw)) {
            return true;
          }
        }
        return false;
      }
      case 'all': {
        for (const kw of kws) {
          if (!words.has(kw)) {
            return false;
          }
        }
        return true;
      }
      case 'none': {
        for (const kw of kws) {
          if (words.has(kw)) {
            return false;
          }
        }
        return true;
      }
      case 'min': {
        const min = check.min;
        let count = 0;
        for (const kw of kws) {
          if (words.has(kw)) {
            count++;
          }
          if (count >= min) {
            return true;
          }
        }
        return false;
      }
      case 'max': {
        const max = check.max;
        let count = 0;
        for (const kw of kws) {
          if (words.has(kw)) {
            count++;
          }
          if (count > max) {
            return false;
          }
        }
        return true;
      }
      case 'range': {
        const max = check.max;
        const min = check.min;
        let count = 0;
        for (const kw of kws) {
          if (words.has(kw)) {
            count++;
          }
        }
        return count >= min && count <= max;
      }
    }
  }

  private exactKeyword(email: IEmail, keywords: string[], check: any) {
    const text = htmlToText.fromString(email.html).toLowerCase();

    switch (check.type) {
      case 'any': {
        for (const kw of keywords) {
          if (text.includes(kw)) {
            return true;
          }
        }
        return false;
      }
      case 'all': {
        for (const kw of keywords) {
          if (!text.includes(kw)) {
            return false;
          }
        }
        return true;
      }
      case 'none': {
        for (const kw of keywords) {
          if (text.includes(kw)) {
            return false;
          }
        }
        return true;
      }
      case 'min': {
        const min = check.min;
        let count = 0;
        for (const kw of keywords) {
          if (text.includes(kw)) {
            count++;
          }
          if (count >= min) {
            return true;
          }
        }
        return false;
      }
      case 'max': {
        const max = check.max;
        let count = 0;
        for (const kw of keywords) {
          if (text.includes(kw)) {
            count++;
          }
          if (count > max) {
            return false;
          }
        }
        return true;
      }
      case 'range': {
        const max = check.max;
        const min = check.min;
        let count = 0;
        for (const kw of keywords) {
          if (text.includes(kw)) {
            count++;
          }
        }
        return count >= min && count <= max;
      }
    }
  }

  private sender(email: IEmail, emails: string[], check: any) {
    const senders = email.header.from;

    switch (check.type) {
      case 'any': {
        for (const sender of emails) {
          if (senders.includes(sender)) {
            return true;
          }
        }
        return false;
      }
      case 'all': {
        for (const sender of emails) {
          if (!senders.includes(sender)) {
            return false;
          }
        }
        return true;
      }
      case 'none': {
        for (const sender of emails) {
          if (senders.includes(sender)) {
            return false;
          }
        }
        return true;
      }
      case 'min': {
        const min = check.min;
        let count = 0;
        for (const sender of emails) {
          if (senders.includes(sender)) {
            count++;
          }
          if (count >= min) {
            return true;
          }
        }
        return false;
      }
      case 'max': {
        const max = check.max;
        let count = 0;
        for (const sender of emails) {
          if (senders.includes(sender)) {
            count++;
          }
          if (count > max) {
            return false;
          }
        }
        return true;
      }
      case 'range': {
        const max = check.max;
        const min = check.min;
        let count = 0;
        for (const sender of emails) {
          if (senders.includes(sender)) {
            count++;
          }
        }
        return count >= min && count <= max;
      }
    }
  }

  private cc(email: IEmail, emails: string[], check: any) {
    const ccs = email.header.cc;

    switch (check.type) {
      case 'any': {
        for (const sender of emails) {
          if (ccs.includes(sender)) {
            return true;
          }
        }
        return false;
      }
      case 'all': {
        for (const sender of emails) {
          if (!ccs.includes(sender)) {
            return false;
          }
        }
        return true;
      }
      case 'none': {
        for (const sender of emails) {
          if (ccs.includes(sender)) {
            return false;
          }
        }
        return true;
      }
      case 'min': {
        const min = check.min;
        let count = 0;
        for (const sender of emails) {
          if (ccs.includes(sender)) {
            count++;
          }
          if (count >= min) {
            return true;
          }
        }
        return false;
      }
      case 'max': {
        const max = check.max;
        let count = 0;
        for (const sender of emails) {
          if (ccs.includes(sender)) {
            count++;
          }
          if (count > max) {
            return false;
          }
        }
        return true;
      }
      case 'range': {
        const max = check.max;
        const min = check.min;
        let count = 0;
        for (const sender of emails) {
          if (ccs.includes(sender)) {
            count++;
          }
        }
        return count >= min && count <= max;
      }
    }
  }
}

export default EmailAnalyzerService;
