/**
 * Request validation driven by the rules generated from the spec (src/generated/schemas.ts).
 *
 * JavaScript callers get no compile-time checks, so every request is checked before it is sent:
 * required fields, unknown fields, types, enums, lengths, item counts, numeric ranges, patterns,
 * `x-max-bytes` byte limits, "exactly one channel key per messageFlow item" and the conditional requirements
 * of `x-sdk-required-if` (see {@link RequiredIfRule}).
 *
 * Issues carry the field path and the reason only. Input values (phone numbers, message text) are never
 * copied into an issue.
 *
 * @module
 */
import { ValidationError, type ValidationIssue } from './errors.js';
import { SCHEMAS } from './generated/schemas.js';
import { isUploadFile } from './upload.js';

interface Nullable {
  readonly nullable?: boolean;
}
export interface StringRule extends Nullable {
  readonly type: 'string';
  readonly enum?: readonly string[];
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly maxBytes?: number;
  readonly charset?: string;
}
export interface NumberRule extends Nullable {
  readonly type: 'integer' | 'number';
  readonly minimum?: number;
  readonly maximum?: number;
}
export interface BooleanRule extends Nullable {
  readonly type: 'boolean';
}
export interface ArrayRule extends Nullable {
  readonly type: 'array';
  readonly items: Rule;
  readonly minItems?: number;
  readonly maxItems?: number;
}
export interface ObjectRule extends Nullable {
  readonly type: 'object';
  /** Declared properties. Absent for free-form objects. */
  readonly properties?: Readonly<Record<string, Rule>>;
  readonly required?: readonly string[];
  /** Reject properties that are not declared. */
  readonly closed?: boolean;
  /** Rule for every value of a map (`additionalProperties: {...}`). */
  readonly values?: Rule;
  /** Conditional requirements (`x-sdk-required-if`). All rules apply (AND). */
  readonly requiredIf?: readonly RequiredIfRule[];
}
/**
 * One `x-sdk-required-if` rule (bizgo-api-spec AGENTS.md rule 11, SDK-DESIGN.md §4).
 *
 * `when.field` is a property of the object the rule is on; values are compared as strings. A missing (or null)
 * field makes `equals`/`in` false and `notEquals`/`notIn` true. `required` lists own properties;
 * `requiredPaths` are dot paths relative to the object, or to the request body when they start with `$.`
 * (`name[]` = every element; an absent or empty array has nothing to check).
 */
export interface RequiredIfRule {
  readonly when: {
    readonly field: string;
    readonly op: 'equals' | 'notEquals' | 'in' | 'notIn';
    readonly values: readonly string[];
  };
  readonly required?: readonly string[];
  readonly requiredPaths?: readonly string[];
}
export interface RefRule {
  readonly type: 'ref';
  readonly ref: string;
}
/** A `messageFlow` item: an object with exactly one channel key. */
export interface ChannelRule {
  readonly type: 'channel';
  readonly channels: Readonly<Record<string, string>>;
}
/** A multipart file field: a path, bytes, a Blob or `{ data, filename }`. */
export interface BinaryRule {
  readonly type: 'binary';
  /** Maximum size in bytes (`x-max-bytes`), checked when the file is bytes or a Blob. */
  readonly maxBytes?: number;
}
export type Rule = StringRule | NumberRule | BooleanRule | ArrayRule | ObjectRule | RefRule | ChannelRule | BinaryRule;

type ByteCount = { bytes: number } | { invalidAt: number };

/**
 * Encoded length of `value` the way the carrier counts it.
 *
 * For `EUC-KR` fields this is the approximation documented in SDK-DESIGN.md §4, because JavaScript runtimes
 * have no CP949 encoder: ASCII = 1 byte, any other character in the Basic Multilingual Plane = 2 bytes
 * (Hangul syllables are 2 bytes in CP949), characters outside the BMP (emoji, ...) cannot be sent.
 * Other charsets count UTF-8 bytes.
 */
export function byteLength(value: string, charset?: string): ByteCount {
  if (charset?.toUpperCase() !== 'EUC-KR') return { bytes: new TextEncoder().encode(value).length };
  let bytes = 0;
  let index = 0;
  for (const char of value) {
    index += 1;
    const code = char.codePointAt(0) ?? 0;
    if (code > 0xffff || (code >= 0xd800 && code <= 0xdfff)) return { invalidAt: index };
    bytes += code < 0x80 ? 1 : 2;
  }
  return { bytes };
}

const patterns = new Map<string, RegExp>();
function regex(pattern: string): RegExp {
  let compiled = patterns.get(pattern);
  if (!compiled) {
    compiled = new RegExp(pattern, 'u');
    patterns.set(pattern, compiled);
  }
  return compiled;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Field names are shown in paths; keep them short and printable. They are names, not values. */
function key(name: string): string {
  const safe = /^[A-Za-z_$][\w$]{0,63}$/.test(name);
  return safe ? name : JSON.stringify(name.length > 40 ? `${name.slice(0, 40)}…` : name);
}

function join(path: string, name: string): string {
  return path ? `${path}.${key(name)}` : key(name);
}

const TYPE_NAMES: Record<string, string> = {
  string: '문자열',
  integer: '정수',
  number: '숫자',
  boolean: 'true/false',
  array: '배열',
  object: '객체',
};

const OPERATOR_TEXT: Record<RequiredIfRule['when']['op'], string> = {
  equals: '==',
  notEquals: '!=',
  in: 'in',
  notIn: 'not in',
};

function resolve(rule: Rule | undefined): Rule | undefined {
  let current = rule;
  for (let depth = 0; current?.type === 'ref' && depth < 16; depth += 1) current = SCHEMAS[current.ref];
  return current;
}

function present(value: unknown): boolean {
  return value !== undefined && value !== null;
}

class Validator {
  readonly issues: ValidationIssue[] = [];
  /** Paths already reported as missing, so a field is not reported twice (static and conditional rules). */
  readonly #missing = new Set<string>();
  readonly #root: unknown;
  readonly #rootRule: Rule | undefined;

  /** `root` is the whole request body, used by `$.` paths of `x-sdk-required-if`. */
  constructor(root: unknown, rootRule: Rule | undefined) {
    this.#root = root;
    this.#rootRule = resolve(rootRule);
  }

  missing(path: string, message: string): void {
    if (this.#missing.has(path)) return;
    this.#missing.add(path);
    this.issues.push({ path, message });
  }

  fail(path: string, message: string): undefined {
    this.issues.push({ path, message });
    return undefined;
  }

  /** Returns the value to serialize: a copy without `undefined` members. */
  check(rule: Rule, value: unknown, path: string): unknown {
    switch (rule.type) {
      case 'ref': {
        const target = SCHEMAS[rule.ref];
        if (!target) throw new Error(`unknown schema ${rule.ref}`);
        return this.check(target, value, path);
      }
      case 'channel':
        return this.channel(rule, value, path);
      case 'string':
        return this.string(rule, value, path);
      case 'integer':
      case 'number':
        return this.number(rule, value, path);
      case 'boolean':
        return typeof value === 'boolean' ? value : this.fail(path, `${TYPE_NAMES.boolean}여야 합니다`);
      case 'array':
        return this.array(rule, value, path);
      case 'object':
        return this.object(rule, value, path);
      case 'binary':
        return this.binary(rule, value, path);
    }
  }

  binary(rule: BinaryRule, value: unknown, path: string): unknown {
    if (!isUploadFile(value)) {
      return this.fail(path, '파일 경로, Buffer/Uint8Array, ArrayBuffer, Blob, { data, filename } 중 하나여야 합니다');
    }
    const data = (value as { data?: unknown }).data ?? value;
    const size =
      data instanceof Uint8Array || data instanceof ArrayBuffer
        ? data.byteLength
        : typeof Blob !== 'undefined' && data instanceof Blob
          ? data.size
          : undefined;
    if (rule.maxBytes !== undefined && size !== undefined && size > rule.maxBytes) {
      this.fail(path, `파일은 최대 ${rule.maxBytes}byte인데 ${size}byte입니다`);
    }
    return value;
  }

  string(rule: StringRule, value: unknown, path: string): unknown {
    if (typeof value !== 'string') return this.fail(path, '문자열이어야 합니다');
    if (rule.enum && !rule.enum.includes(value)) {
      return this.fail(path, `허용된 값이 아닙니다 (허용: ${rule.enum.join(', ')})`);
    }
    const length = rule.minLength !== undefined || rule.maxLength !== undefined ? [...value].length : 0;
    if (rule.minLength !== undefined && length < rule.minLength) this.fail(path, `최소 ${rule.minLength}자입니다`);
    if (rule.maxLength !== undefined && length > rule.maxLength) {
      this.fail(path, `최대 ${rule.maxLength}자인데 ${length}자입니다`);
    }
    if (rule.pattern !== undefined && !regex(rule.pattern).test(value)) {
      this.fail(path, `형식이 올바르지 않습니다 (패턴 ${rule.pattern})`);
    }
    if (rule.maxBytes !== undefined) {
      const counted = byteLength(value, rule.charset);
      if ('invalidAt' in counted) {
        this.fail(
          path,
          `${counted.invalidAt}번째 글자는 ${rule.charset}로 표현할 수 없습니다 (이모지 등은 문자메시지에 쓸 수 없습니다)`,
        );
      } else if (counted.bytes > rule.maxBytes) {
        const unit = rule.charset ? ` (${rule.charset} 기준)` : '';
        this.fail(path, `최대 ${rule.maxBytes}byte인데 ${counted.bytes}byte입니다${unit}`);
      }
    }
    return value;
  }

  number(rule: NumberRule, value: unknown, path: string): unknown {
    const ok =
      typeof value === 'number' && Number.isFinite(value) && (rule.type === 'number' || Number.isInteger(value));
    if (!ok) return this.fail(path, `${TYPE_NAMES[rule.type]}여야 합니다`);
    if (rule.minimum !== undefined && value < rule.minimum) this.fail(path, `${rule.minimum} 이상이어야 합니다`);
    if (rule.maximum !== undefined && value > rule.maximum) this.fail(path, `${rule.maximum} 이하여야 합니다`);
    return value;
  }

  array(rule: ArrayRule, value: unknown, path: string): unknown {
    if (!Array.isArray(value)) return this.fail(path, '배열이어야 합니다');
    if (rule.minItems !== undefined && value.length < rule.minItems) {
      this.fail(path, `최소 ${rule.minItems}개가 필요합니다`);
    }
    if (rule.maxItems !== undefined && value.length > rule.maxItems) {
      // stop here: validating thousands of items would only produce noise
      return this.fail(path, `최대 ${rule.maxItems}개인데 ${value.length}개입니다`);
    }
    return value.map((item, index) => this.member(rule.items, item, `${path}[${index}]`));
  }

  object(rule: ObjectRule, value: unknown, path: string): unknown {
    if (!isRecord(value)) return this.fail(path, '객체여야 합니다');
    if (!rule.properties && !rule.values) return value; // free-form object: passed through as is
    const out: Record<string, unknown> = {};
    for (const name of rule.required ?? []) {
      if (!present(value[name])) this.missing(join(path, name), '필수 필드입니다');
    }
    for (const conditional of rule.requiredIf ?? []) this.requiredIf(conditional, value, path);
    for (const [name, member] of Object.entries(value)) {
      if (member === undefined) continue;
      const declared = rule.properties?.[name];
      const memberRule = declared ?? rule.values;
      if (!memberRule) {
        if (rule.closed) this.fail(join(path, name), '알 수 없는 필드입니다');
        else out[name] = member;
        continue;
      }
      if (member === null && rule.required?.includes(name)) continue; // already reported
      const checked = this.member(memberRule, member, join(path, name));
      if (checked !== undefined) out[name] = checked;
    }
    return out;
  }

  /** Apply one `x-sdk-required-if` rule to the (raw) object `value` found at `path`. Values are never quoted. */
  requiredIf(rule: RequiredIfRule, value: Record<string, unknown>, path: string): void {
    const { field, op, values } = rule.when;
    const actual = value[field];
    const primitive = typeof actual === 'string' || typeof actual === 'number' || typeof actual === 'boolean';
    const matches = primitive && values.includes(String(actual));
    if ((op === 'equals' || op === 'in') !== matches) return;
    const list = op === 'in' || op === 'notIn' ? `(${values.join(', ')})` : (values[0] as string);
    const reason = `${join(path, field)} ${OPERATOR_TEXT[op]} ${list}일 때 필수입니다`;
    for (const name of rule.required ?? []) {
      if (!present(value[name])) this.missing(join(path, name), reason);
    }
    for (const spec of rule.requiredPaths ?? []) {
      if (spec.startsWith('$.')) {
        const segments = spec.slice(2).split('.');
        const first = (segments[0] as string).replace(/\[\]$/, '');
        // the request body does not have this property (e.g. recipients-only APIs): nothing to check
        const root = this.#rootRule;
        if (root?.type !== 'object' || !root.properties?.[first]) continue;
        this.walk(this.#root, segments, '', reason);
      } else {
        this.walk(value, spec.split('.'), path, reason);
      }
    }
  }

  /** Report the leaf of `segments` under `node` when it is missing. Wrong types are reported by the type checks. */
  walk(node: unknown, segments: readonly string[], path: string, reason: string): void {
    if (!isRecord(node)) return;
    const [head, ...rest] = segments as [string, ...string[]];
    const each = head.endsWith('[]');
    const name = each ? head.slice(0, -2) : head;
    const here = join(path, name);
    const member = node[name];
    if (each) {
      if (!Array.isArray(member) || rest.length === 0) return; // absent or empty: no element to check
      member.forEach((item, index) => {
        this.walk(item, rest, `${here}[${index}]`, reason);
      });
      return;
    }
    if (rest.length === 0) {
      if (!present(member)) this.missing(here, reason);
      return;
    }
    if (present(member)) {
      this.walk(member, rest, here, reason);
      return;
    }
    // a missing intermediate object makes the path missing, unless an array follows (then nothing to check)
    if (rest.some((segment) => segment.endsWith('[]'))) return;
    this.missing(
      rest.reduce((at, segment) => join(at, segment), here),
      reason,
    );
  }

  /** `null` is allowed for optional members: dropped, or kept when the spec type includes `null`. */
  member(rule: Rule, value: unknown, path: string): unknown {
    if (value === null) {
      if ('nullable' in rule && rule.nullable) return null;
      return undefined;
    }
    return this.check(rule, value, path);
  }

  channel(rule: ChannelRule, value: unknown, path: string): unknown {
    const names = Object.keys(rule.channels);
    if (!isRecord(value)) return this.fail(path, `객체여야 합니다 (채널 키: ${names.join(', ')})`);
    const present = names.filter((name) => value[name] !== undefined && value[name] !== null);
    if (present.length !== 1) {
      return this.fail(path, `messageFlow 항목에는 채널 키(${names.join(', ')}) 중 정확히 하나가 있어야 합니다`);
    }
    const channel = present[0] as string;
    for (const name of Object.keys(value)) {
      if (name !== channel && value[name] !== undefined) this.fail(join(path, name), '알 수 없는 필드입니다');
    }
    const schema = rule.channels[channel] as string;
    const checked = this.check({ type: 'ref', ref: schema }, value[channel], join(path, channel));
    return { [channel]: checked };
  }
}

/**
 * Validate `value` against the named schema and return the object to serialize.
 * Throws {@link ValidationError} listing every problem found.
 */
export function validate<T>(schema: string, value: unknown, path = ''): T {
  const rule: Rule = { type: 'ref', ref: schema };
  const validator = new Validator(value, rule);
  const out = validator.check(rule, value, path);
  if (validator.issues.length > 0) throw new ValidationError(validator.issues);
  return out as T;
}

/** Validate `value` against an inline rule (query and header parameters). */
export function validateWith(rule: Rule, value: unknown, path = ''): unknown {
  const validator = new Validator(value, rule);
  const out = validator.check(rule, value, path);
  if (validator.issues.length > 0) throw new ValidationError(validator.issues);
  return out;
}

/** Collect problems without throwing (used for webhook payloads). */
export function problems(schema: string, value: unknown): readonly ValidationIssue[] {
  const rule: Rule = { type: 'ref', ref: schema };
  const validator = new Validator(value, rule);
  validator.check(rule, value, '');
  return validator.issues;
}

/** Reject option names the method does not know, so a typo (`idempotency_key`) never goes unnoticed. */
export function checkOptions(options: unknown, allowed: readonly string[], what: string): Record<string, unknown> {
  if (options === undefined) return {};
  if (!isRecord(options)) throw new ValidationError(`${what}: 옵션은 객체여야 합니다`);
  const unknown = Object.keys(options).filter((name) => !allowed.includes(name) && options[name] !== undefined);
  if (unknown.length > 0) {
    throw new ValidationError(
      unknown.map((name) => ({
        path: key(name),
        message: `${what}에서 알 수 없는 옵션입니다 (허용: ${allowed.join(', ')})`,
      })),
    );
  }
  return options;
}
