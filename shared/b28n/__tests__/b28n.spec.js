/* eslint-disable import/no-extraneous-dependencies */
import b28n from 'shared/b28n';

describe('b28n', () => {
  it('version not empty', () => {
    expect(b28n.version).not.toBe('');
  });

  describe('#getLang() and #setLang()', () => {
    it('should return default lang "en" when init with empty or not support lang', () => {
      b28n.setLang('');

      expect(b28n.getLang()).toBe('en');
    });

    it('should return default lang "en" when init with empty or not support lang', () => {
      b28n.setLang('');
      expect(b28n.getLang()).toBe('en');

      b28n.init({
        lang: 'hr',
      });

      expect(b28n.getLang()).toBe('en');
    });

    it('should return default lang "en" when setLang with empty or not support lang', () => {
      b28n.setLang('');
      expect(b28n.getLang()).toBe('en');
      b28n.setLang('ok');
      expect(b28n.getLang()).toBe('en');
    });

    it('should return lang when setLang with support lang', () => {
      b28n.setLang('cn');

      expect(b28n.getLang()).toBe('cn');
    });
  });

  describe('#addDict()', () => {
    it('should return added dict', () => {
      b28n.addDict({ adb: 'dasdds' }, 'cn');
      expect(b28n.getDict('cn').adb).toBe('dasdds');
      b28n.addDict({ adb: 'dasdds' });
      expect(b28n.getDict().adb).toBe('dasdds');
    });
  });

  describe('#translate()', () => {
    const testDict = {
      english: '英语',
      dict: '词典',
    };

    b28n.addDict(testDict, 'cn');
    it('should do nothing when key not in dict', () => {
      expect(b28n.translate('nothing')).toBe('nothing');
    });

    it('should translate with added dict', () => {
      expect(b28n.translate('english')).toBe('英语');
      b28n.setLang('en');
      expect(b28n.translate('english')).toBe('english');
    });
  });

  describe('#__()', () => {
    const testDict = {
      english: '英语',
      dict: '词典',
      'This is %s and %s': '这是 %s 和 %s',
    };
    b28n.addDict(testDict, 'cn');

    it('should do nothing when key not in dict', () => {
      expect(__('nothing')).toBe('nothing');
    });

    it('should translate with added dict', () => {
      b28n.setLang('cn');
      expect(__('english')).toBe('英语');
      b28n.setLang('en');
      expect(__('english')).toBe('english');
    });

    it('should translate with added dict and repalce %s', () => {
      b28n.setLang('cn');
      expect(__('This is %s and %s', 12, 23)).toBe('这是 12 和 23');
    });
  });
});
