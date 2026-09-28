// Generate the typed SDK surface from the vendored spec.
//
//   node scripts/generate.mjs          # write src/generated/*.ts
//   node scripts/generate.mjs --check  # exit 1 if any generated file is out of date (CI)
//
// Outputs (src/generated/, never edited by hand):
//   types.ts        interfaces for every component schema, with the spec descriptions as TSDoc
//   schemas.ts      validation rules for every request body (closed) and webhook payload (open, `webhook:` prefix);
//                   read by src/validation.ts
//   error-codes.ts  service-layer (data.code) codes -> [documented HTTP status, Korean description]
//   operations.ts   one metadata entry per operation (method, path template, x-sdk-retry, rate bucket, params,
//                   body kind, x-sdk-result, x-sdk-pagination); read by src/operation.ts, hooks and the testing kit
//   resources.ts    resource classes nested per x-sdk-resource with one method per x-sdk-method (+ iter<Method>
//                   for x-sdk-pagination), typed params/result aliases, and the GeneratedClient base class
//   webhooks.ts     one parser per x-sdk-webhook (GeneratedWebhookReceiver) and the webhook table
//
// Hand-written methods in src/resources/<root>.ts win: a generated method is skipped when the hand-written class
// of that root already defines a method with the same name.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = join(ROOT, 'spec', 'openapi.yaml');
const ERROR_CODES = join(ROOT, 'spec', 'error-codes.json');
const OUT = join(ROOT, 'src', 'generated');
const HANDWRITTEN = join(ROOT, 'src', 'resources');
const HEADER = '// Generated from spec/openapi.yaml by scripts/generate.mjs. Do not edit.\n';
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const spec = parse(readFileSync(SPEC, 'utf8'));
const schemas = spec.components.schemas;
const parameters = spec.components.parameters ?? {};

function refName(ref) {
  const prefix = '#/components/schemas/';
  if (typeof ref !== 'string' || !ref.startsWith(prefix)) throw new Error(`unsupported $ref: ${ref}`);
  const name = ref.slice(prefix.length);
  if (!schemas[name]) throw new Error(`unknown schema: ${name}`);
  return name;
}

function refsOf(node, found = new Set()) {
  if (Array.isArray(node)) {
    for (const item of node) refsOf(item, found);
  } else if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string') found.add(refName(node.$ref));
    for (const [key, value] of Object.entries(node)) if (key !== 'example' && key !== 'examples') refsOf(value, found);
  }
  return found;
}

function closure(roots) {
  const seen = new Set();
  const stack = [...roots];
  while (stack.length > 0) {
    const name = stack.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    for (const ref of refsOf(schemas[name])) if (!seen.has(ref)) stack.push(ref);
  }
  return seen;
}

function pascal(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function literal(value) {
  return typeof value === 'string' ? `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'` : String(value);
}

function isBinary(schema) {
  return schema?.type === 'string' && schema.format === 'binary';
}

// ------------------------------------------------------------------------------------------ operations

function resolveParam(param) {
  if (param.$ref) {
    const name = param.$ref.split('/').pop();
    if (!parameters[name]) throw new Error(`unknown parameter: ${param.$ref}`);
    return parameters[name];
  }
  return param;
}

const operations = [];
for (const [path, item] of Object.entries(spec.paths)) {
  for (const method of HTTP_METHODS) {
    const op = item[method];
    if (!op) continue;
    for (const key of ['operationId', 'x-sdk-resource', 'x-sdk-method', 'x-sdk-retry']) {
      if (!op[key]) throw new Error(`${method} ${path}: ${key} is missing`);
    }
    if (!['safe', 'rate_limit_only'].includes(op['x-sdk-retry'])) throw new Error(`${op.operationId}: bad x-sdk-retry`);
    const params = [...(item.parameters ?? []), ...(op.parameters ?? [])].map(resolveParam);
    operations.push({ path, method: method.toUpperCase(), op, params });
  }
}

/** Body schema names per operation: `{ json?: name, form?: name, required }`. */
function bodyOf(op) {
  if (!op.requestBody) return undefined;
  const out = { required: op.requestBody.required === true };
  for (const [type, content] of Object.entries(op.requestBody.content)) {
    const name = refName(content.schema.$ref);
    if (type === 'application/json') out.json = name;
    else if (type === 'multipart/form-data') {
      out.form = name;
      out.encoding = content.encoding ?? {};
    } else throw new Error(`${op.operationId}: unsupported body type ${type}`);
  }
  return out;
}

// Request roots: every body schema. Webhook roots: every webhook payload.
const requestRoots = new Set();
for (const { op } of operations) {
  const body = bodyOf(op);
  if (body?.json) requestRoots.add(body.json);
  if (body?.form) requestRoots.add(body.form);
}
const requestNames = closure(requestRoots);

const webhooks = [];
for (const [name, item] of Object.entries(spec.webhooks ?? {})) {
  const op = item.post;
  if (!op?.['x-sdk-webhook']) throw new Error(`webhook ${name}: x-sdk-webhook is missing`);
  const payload = refName(op.requestBody.content['application/json'].schema.$ref);
  const ack = refName(op.responses['200'].content['application/json'].schema.$ref);
  const headers = (op.parameters ?? []).map(resolveParam).filter((p) => p.in === 'header');
  webhooks.push({ name: op['x-sdk-webhook'], op, payload, ack, headers });
}
const webhookNames = closure(webhooks.map((w) => w.payload));

/** `oneOf` whose members are `{ <key>: Message }` objects with exactly one required key (messageFlow items). */
function channelUnion(schema) {
  if (!Array.isArray(schema.oneOf)) return null;
  const channels = {};
  for (const member of schema.oneOf) {
    const name = refName(member.$ref);
    const item = schemas[name];
    const keys = Object.keys(item.properties ?? {});
    if (
      item.type !== 'object' ||
      item.additionalProperties !== false ||
      keys.length !== 1 ||
      item.required?.length !== 1 ||
      item.required[0] !== keys[0] ||
      !item.properties[keys[0]].$ref
    ) {
      throw new Error(`${name}: oneOf members must be single-key channel objects`);
    }
    channels[keys[0]] = { item: name, message: refName(item.properties[keys[0]].$ref) };
  }
  return channels;
}

const flowChannels = channelUnion(schemas.MessageFlowItem);
/** FlowItem schema name -> channel key, so the item interfaces can forbid the other keys. */
const flowItemKey = Object.fromEntries(Object.entries(flowChannels).map(([key, v]) => [v.item, key]));

// ---------------------------------------------------------------------------------------------- types.ts

function tsdoc(schema, indent) {
  const lines = [];
  if (schema.description) lines.push(...String(schema.description).trimEnd().split('\n'));
  const constraints = [];
  for (const key of ['minLength', 'maxLength', 'minItems', 'maxItems', 'minimum', 'maximum', 'pattern']) {
    if (schema[key] !== undefined) constraints.push(`${key}=${schema[key]}`);
  }
  if (schema['x-max-bytes'] !== undefined) {
    constraints.push(`최대 ${schema['x-max-bytes']}byte${schema['x-charset'] ? ` (${schema['x-charset']})` : ''}`);
  }
  if (schema['x-format']) constraints.push(`형식 ${schema['x-format']}`);
  if (constraints.length > 0) lines.push('', `제약: ${constraints.join(', ')}`);
  if (schema['x-unverified']) lines.push('', `확인 필요: ${String(schema['x-unverified']).trim()}`);
  if (schema.default !== undefined) {
    lines.push(`@defaultValue ${JSON.stringify(schema.default)} (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)`);
  }
  return docBlock(lines, indent);
}

function docBlock(lines, indent) {
  if (lines.length === 0) return '';
  const pad = ' '.repeat(indent);
  const body = lines.map((line) => `${pad} *${line ? ` ${line.replaceAll('*/', '*\\/')}` : ''}`).join('\n');
  return `${pad}/**\n${body}\n${pad} */\n`;
}

function tsType(schema, indent, open) {
  if (schema.$ref) return refName(schema.$ref);
  if (schema.allOf) return schema.allOf.map((part) => tsType(part, indent, open)).join(' & ');
  if (schema.oneOf) return schema.oneOf.map((part) => tsType(part, indent, open)).join(' | ');
  if (isBinary(schema)) return 'UploadFile';
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const nullable = types.includes('null');
  const base = types.filter((t) => t !== 'null');
  if (base.length !== 1) throw new Error(`unsupported type: ${JSON.stringify(schema.type)}`);
  let out;
  switch (base[0]) {
    case 'string':
      if (schema.enum) out = schema.enum.map(literal).join(' | ');
      else if (schema['x-known-values']) out = `${schema['x-known-values'].map(literal).join(' | ')} | (string & {})`;
      else out = 'string';
      break;
    case 'integer':
    case 'number':
      out = 'number';
      break;
    case 'boolean':
      out = 'boolean';
      break;
    case 'array': {
      const item = tsType(schema.items, indent, open);
      out = /^[\w.]+$/.test(item) ? `${item}[]` : `Array<${item}>`;
      break;
    }
    case 'object':
      if (schema.properties) out = objectBody(schema, indent, open, null);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        out = `Record<string, ${tsType(schema.additionalProperties, indent, open)}>`;
      } else out = 'Record<string, unknown>';
      break;
    default:
      throw new Error(`unsupported type: ${base[0]}`);
  }
  return nullable ? `${out} | null` : out;
}

function propertyKey(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : literal(name);
}

function objectBody(schema, indent, open, channelKey) {
  const pad = ' '.repeat(indent + 2);
  const required = new Set(schema.required ?? []);
  const lines = [];
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    lines.push(
      `${tsdoc(prop, indent + 2)}${pad}${propertyKey(name)}${required.has(name) ? '' : '?'}: ${tsType(prop, indent + 2, open)};`,
    );
  }
  if (channelKey) {
    for (const other of Object.keys(flowChannels)) {
      if (other !== channelKey) lines.push(`${pad}${other}?: never;`);
    }
  }
  if (open) {
    lines.push(`${pad}/** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */`);
    lines.push(`${pad}[key: string]: unknown;`);
  }
  return `{\n${lines.join('\n')}\n${' '.repeat(indent)}}`;
}

function typesFile() {
  const parts = [];
  for (const [name, schema] of Object.entries(schemas)) {
    const open = !requestNames.has(name);
    const doc = tsdoc(schema, 0);
    if (schema.type === 'object' && schema.properties) {
      parts.push(`${doc}export interface ${name} ${objectBody(schema, 0, open, flowItemKey[name] ?? null)}\n\n`);
    } else {
      parts.push(`${doc}export type ${name} = ${tsType(schema, 0, open)};\n\n`);
    }
  }
  const body = parts.join('');
  return [
    HEADER,
    `// Spec: ${spec.info.title} ${spec.info.version}\n`,
    '//\n',
    '// Request types (every request body and everything it references) are closed: the SDK rejects unknown\n',
    '// fields before sending. Response types carry an index signature because the server may add fields.\n',
    '\n',
    body.includes('UploadFile') ? "import type { UploadFile } from '../upload.js';\n\n" : '',
    body.trimEnd(),
    '\n',
  ].join('');
}

// -------------------------------------------------------------------------------------------- schemas.ts

/** Merge an `allOf` (refs and inline objects) into one object schema. */
function mergeAllOf(schema) {
  const properties = {};
  const required = new Set();
  const requiredIf = [];
  const visit = (part) => {
    if (part.$ref) return visit(schemas[refName(part.$ref)]);
    if (part.allOf) {
      for (const inner of part.allOf) visit(inner);
    }
    if (part.type !== undefined && part.type !== 'object') throw new Error('allOf members must be objects');
    Object.assign(properties, part.properties ?? {});
    for (const name of part.required ?? []) required.add(name);
    requiredIf.push(...(part['x-sdk-required-if'] ?? []));
  };
  visit(schema);
  const out = { type: 'object', properties, required: [...required] };
  if (requiredIf.length) out['x-sdk-required-if'] = requiredIf;
  return out;
}

const REQUIRED_IF_OPERATORS = ['equals', 'notEquals', 'in', 'notIn'];
const REQUIRED_PATH = /^(\$\.)?[A-Za-z_][\w]*(\[\])?(\.[A-Za-z_][\w]*(\[\])?)*$/;

/**
 * `x-sdk-required-if` (bizgo-api-spec AGENTS.md rule 11, SDK-DESIGN.md §4) → `requiredIf` rules for
 * src/validation.ts. The format is checked here so a typo in the spec fails generation, not a send.
 */
function requiredIfRules(schema, where) {
  const rules = schema['x-sdk-required-if'];
  if (rules === undefined) return undefined;
  if (!Array.isArray(rules) || rules.length === 0) throw new Error(`${where}: x-sdk-required-if must be a list`);
  const props = schema.properties ?? {};
  return rules.map((r, i) => {
    const at = `${where}: x-sdk-required-if[${i}]`;
    const extra = Object.keys(r ?? {}).filter((k) => !['when', 'required', 'requiredPaths'].includes(k));
    if (extra.length) throw new Error(`${at}: unknown keys ${extra.join(', ')}`);
    const when = r?.when ?? {};
    if (typeof when.field !== 'string' || !(when.field in props))
      throw new Error(`${at}: when.field must be a property`);
    const ops = Object.keys(when).filter((k) => k !== 'field');
    if (ops.length !== 1 || !REQUIRED_IF_OPERATORS.includes(ops[0])) {
      throw new Error(`${at}: when needs exactly one of ${REQUIRED_IF_OPERATORS.join(', ')}`);
    }
    const op = ops[0];
    const list = op === 'in' || op === 'notIn';
    const raw = when[op];
    if (
      list ? !Array.isArray(raw) || raw.length === 0 : Array.isArray(raw) || raw === null || typeof raw === 'object'
    ) {
      throw new Error(`${at}: ${op} needs ${list ? 'a list of values' : 'one value'}`);
    }
    const out = { when: { field: when.field, op, values: (list ? raw : [raw]).map(String) } };
    if (r.required !== undefined) {
      if (!Array.isArray(r.required) || r.required.some((n) => !(n in props))) {
        throw new Error(`${at}: required must list properties of the schema`);
      }
      out.required = r.required;
    }
    if (r.requiredPaths !== undefined) {
      if (
        !Array.isArray(r.requiredPaths) ||
        r.requiredPaths.some((p) => typeof p !== 'string' || !REQUIRED_PATH.test(p))
      ) {
        throw new Error(`${at}: requiredPaths must be paths like "$.a[].b" or "a.b"`);
      }
      out.requiredPaths = r.requiredPaths;
    }
    if (!out.required?.length && !out.requiredPaths?.length) throw new Error(`${at}: needs required or requiredPaths`);
    return out;
  });
}

function rule(schema, closed, prefix, where = 'schema') {
  if (schema.$ref) return { type: 'ref', ref: `${prefix}${refName(schema.$ref)}` };
  if (schema.oneOf) {
    const channels = channelUnion(schema);
    return {
      type: 'channel',
      channels: Object.fromEntries(Object.entries(channels).map(([key, v]) => [key, `${prefix}${v.message}`])),
    };
  }
  if (schema.allOf) return rule(mergeAllOf(schema), closed, prefix, where);
  if (isBinary(schema)) {
    const out = { type: 'binary' };
    if (schema['x-max-bytes'] !== undefined) out.maxBytes = schema['x-max-bytes'];
    return out;
  }
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const base = types.filter((t) => t !== 'null');
  const out = { type: base[0] };
  if (types.includes('null')) out.nullable = true;
  switch (base[0]) {
    case 'string':
      for (const key of ['enum', 'minLength', 'maxLength', 'pattern']) {
        if (schema[key] !== undefined) out[key] = schema[key];
      }
      if (schema['x-max-bytes'] !== undefined) out.maxBytes = schema['x-max-bytes'];
      if (schema['x-charset'] !== undefined) out.charset = schema['x-charset'];
      break;
    case 'integer':
    case 'number':
      for (const key of ['minimum', 'maximum']) if (schema[key] !== undefined) out[key] = schema[key];
      break;
    case 'boolean':
      break;
    case 'array':
      out.items = rule(schema.items, closed, prefix);
      for (const key of ['minItems', 'maxItems']) if (schema[key] !== undefined) out[key] = schema[key];
      break;
    case 'object':
      if (schema.properties) {
        out.properties = Object.fromEntries(
          Object.entries(schema.properties).map(([name, prop]) => [name, rule(prop, closed, prefix)]),
        );
        if (schema.required?.length) out.required = schema.required;
        if (closed) out.closed = true;
        // conditional requirements apply to requests only (webhook payloads are open and not checked for them)
        const requiredIf = requiredIfRules(schema, where);
        if (requiredIf && closed) out.requiredIf = requiredIf;
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        out.values = rule(schema.additionalProperties, closed, prefix);
      }
      break;
    default:
      throw new Error(`unsupported type: ${base[0]}`);
  }
  return out;
}

function schemasFile() {
  const rows = [];
  for (const name of Object.keys(schemas)) {
    if (!requestNames.has(name) || flowItemKey[name]) continue; // flow items are covered by `channel`
    rows.push(`  ${JSON.stringify(name)}: ${JSON.stringify(rule(schemas[name], true, '', name))},`);
  }
  for (const name of Object.keys(schemas)) {
    if (!webhookNames.has(name)) continue;
    rows.push(`  ${JSON.stringify(`webhook:${name}`)}: ${JSON.stringify(rule(schemas[name], false, 'webhook:'))},`);
  }
  return [
    HEADER,
    '//\n',
    '// Validation rules read by src/validation.ts. Request objects are closed (unknown fields are rejected);\n',
    '// webhook payloads (`webhook:` prefix) are open.\n\n',
    "import type { Rule } from '../validation.js';\n\n",
    'export const SCHEMAS: Readonly<Record<string, Rule>> = {\n',
    rows.join('\n'),
    '\n};\n',
  ].join('');
}

// ---------------------------------------------------------------------------------------- error-codes.ts

function errorCodesFile() {
  const data = JSON.parse(readFileSync(ERROR_CODES, 'utf8'));
  const rows = data.service.map((entry) => {
    const status = entry.httpStatus ? Number(entry.httpStatus) : 0;
    const text = entry.descriptionKo || entry.result || '';
    return `  ${JSON.stringify(entry.code)}: [${status}, ${JSON.stringify(text)}],`;
  });
  return [
    HEADER.replace('spec/openapi.yaml', 'spec/error-codes.json'),
    '\n',
    `export const ERROR_CODES_SOURCE = ${JSON.stringify(data.source)};\n\n`,
    '/** Service layer (`data.code`) codes: code -> [documented HTTP status, Korean description]. */\n',
    'export const SERVICE_CODES: Readonly<Record<string, readonly [number, string]>> = {\n',
    rows.join('\n'),
    '\n};\n',
  ].join('');
}

// --------------------------------------------------------------------------------------- operations.ts

/** `data.data.friendGroups[-1].requestId` -> ['data', 'data', 'friendGroups', -1, 'requestId'] */
function pathSegments(path) {
  const out = [];
  for (const part of path.split('.')) {
    const match = /^([^[\]]+)((?:\[-?\d+\])*)$/.exec(part);
    if (!match) throw new Error(`bad path: ${path}`);
    out.push(match[1]);
    for (const index of match[2].matchAll(/\[(-?\d+)\]/g)) out.push(Number(index[1]));
  }
  return out;
}

/** Walk a schema along a result path; returns the schema node, or undefined if the path is not declared. */
function walk(schema, segments) {
  let node = schema;
  for (const segment of segments) {
    while (node?.$ref) node = schemas[refName(node.$ref)];
    if (node?.allOf) node = mergeAllOf(node);
    if (node === undefined) return undefined;
    if (typeof segment === 'number') {
      if (node.type !== 'array') return undefined;
      node = node.items;
    } else {
      node = node.properties?.[segment];
    }
  }
  return node;
}

function deref(node) {
  let out = node;
  while (out?.$ref) out = schemas[refName(out.$ref)];
  return out;
}

const ops = operations.map(({ path, method, op, params }) => {
  const id = op.operationId;
  const resource = op['x-sdk-resource'];
  const name = op['x-sdk-method'];
  const pathParams = params.filter((p) => p.in === 'path');
  const templateNames = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  if (templateNames.join() !== pathParams.map((p) => p.name).join()) {
    // keep template order; every template variable must be declared
    for (const t of templateNames) {
      if (!pathParams.some((p) => p.name === t)) throw new Error(`${id}: path parameter ${t} is not declared`);
    }
  }
  const query = params.filter((p) => p.in === 'query');
  const headers = params.filter((p) => p.in === 'header');
  const body = bodyOf(op);
  const names = [...templateNames, ...query.map((p) => p.name), ...headers.map((p) => p.name)];
  if (body) names.push('body');
  if (new Set(names).size !== names.length) throw new Error(`${id}: parameter names clash`);

  const response = op.responses['200'];
  const responseSchema = response?.content?.['application/json']?.schema;
  const responseName = responseSchema?.$ref ? refName(responseSchema.$ref) : undefined;
  const resultPath = op['x-sdk-result'] ?? 'data.data';
  const resultNode = responseName ? walk(schemas[responseName], pathSegments(resultPath)) : undefined;
  let kind;
  if (resultNode === undefined) {
    if (responseName !== 'ApiResponse') throw new Error(`${id}: x-sdk-result ${resultPath} not found`);
    kind = 'void';
  } else {
    kind = deref(resultNode).type === 'array' ? 'array' : 'value';
  }

  let pagination;
  const pg = op['x-sdk-pagination'];
  if (pg) {
    if (!['cursor', 'page', 'offset'].includes(pg.style)) throw new Error(`${id}: bad pagination style`);
    if (!query.some((p) => p.name === pg.request)) throw new Error(`${id}: pagination request param missing`);
    if (pg.size && !query.some((p) => p.name === pg.size)) throw new Error(`${id}: pagination size param missing`);
    const itemsNode = walk(schemas[responseName], pathSegments(pg.items));
    if (deref(itemsNode)?.type !== 'array') throw new Error(`${id}: pagination items is not an array`);
    pagination = {
      style: pg.style,
      request: pg.request,
      ...(pg.size ? { size: pg.size } : {}),
      items: pathSegments(pg.items),
      ...(pg.response ? { cursor: pathSegments(pg.response) } : {}),
      ...(pg.hasNext ? { hasNext: pathSegments(pg.hasNext) } : {}),
      ...(pg.total ? { total: pathSegments(pg.total) } : {}),
      itemsNode: deref(itemsNode).items,
    };
  }

  // SDK-DESIGN.md §11.5: only operations tagged `x-sdk-rate: send` use the send bucket (cost = recipients)
  if (op['x-sdk-rate'] !== undefined && op['x-sdk-rate'] !== 'send') throw new Error(`${id}: bad x-sdk-rate`);
  const rate = op['x-sdk-rate'] === 'send' ? 'send' : 'other';
  return {
    id,
    resource,
    name,
    method,
    path,
    op,
    retry: op['x-sdk-retry'] === 'safe' ? 'safe' : 'rateLimitOnly',
    rate,
    templateNames,
    pathParams,
    query,
    headers,
    body,
    result: { path: pathSegments(resultPath), kind, node: resultNode },
    pagination,
  };
});

function queryRule(params) {
  const properties = {};
  const required = [];
  for (const p of params) {
    properties[p.name] = rule(p.schema ?? { type: 'string' }, true, '');
    if (p.required) required.push(p.name);
  }
  const out = { type: 'object', properties, closed: true };
  if (required.length) out.required = required;
  return out;
}

const DATE_FORMATS = new Set(['yyyyMMdd', 'YYYYMMDD']);

function formFields(body) {
  const schema = mergeAllOf(schemas[body.form]);
  const fields = {};
  for (const [name, prop] of Object.entries(schema.properties)) {
    const node = deref(prop);
    if (isBinary(node)) fields[name] = 'file';
    else if (node.type === 'array' && isBinary(deref(node.items))) fields[name] = 'files';
    else if (body.encoding[name]?.contentType === 'application/json' || prop.allOf || node.type === 'object') {
      fields[name] = 'json';
    } else fields[name] = 'text';
  }
  return fields;
}

function operationsFile() {
  const rows = ops.map((o) => {
    const entry = {
      id: o.id,
      name: `${o.resource}.${o.name}`,
      method: o.method,
      path: o.path,
      retry: o.retry,
      rate: o.rate,
      pathParams: o.templateNames,
    };
    if (o.query.length) {
      entry.query = queryRule(o.query);
      const arrays = o.query.filter((p) => p.schema?.type === 'array').map((p) => p.name);
      const dates = o.query.filter((p) => DATE_FORMATS.has(p.schema?.['x-format'])).map((p) => p.name);
      if (arrays.length) entry.arrays = arrays;
      if (dates.length) entry.dates = dates;
    }
    if (o.headers.length) entry.headers = queryRule(o.headers);
    if (o.body) {
      entry.body = { required: o.body.required };
      if (o.body.json) {
        entry.body.json = o.body.json;
        // SDK-DESIGN: a key without a TTL is rejected (A309); the runtime fills idempotencyTtl=86400
        const props = mergeAllOf(schemas[o.body.json]).properties;
        if (props.idempotencyKey && props.idempotencyTtl) entry.body.idempotencyTtl = true;
      }
      if (o.body.form) {
        entry.body.form = o.body.form;
        entry.body.fields = formFields(o.body);
        const text = `${o.op.summary ?? ''} ${o.id}`;
        entry.body.filename = /이미지|image/i.test(text) ? 'image.jpg' : 'file';
      }
    }
    entry.result = { path: o.result.path, kind: o.result.kind };
    if (o.pagination) {
      const { itemsNode, ...pagination } = o.pagination;
      entry.pagination = pagination;
    }
    return `  ${o.id}: ${JSON.stringify(entry)},`;
  });
  return [
    HEADER,
    '//\n',
    '// One entry per spec operation. `name` is `<x-sdk-resource>.<x-sdk-method>`; `path` is the template (hooks\n',
    '// report the template, never the real path values). `rate` is the client-side token bucket.\n\n',
    "import type { Operation } from '../operation.js';\n\n",
    'export const OPERATIONS = {\n',
    rows.join('\n'),
    '\n} as const satisfies Readonly<Record<string, Operation>>;\n\n',
    '/** Every operationId in the spec. */\n',
    'export type OperationId = keyof typeof OPERATIONS;\n',
  ].join('');
}

// ---------------------------------------------------------------------------------------- resources.ts

/** Method names defined by the hand-written class of a root resource (they win over generated ones). */
function handWritten(root) {
  const file = join(HANDWRITTEN, `${root}.ts`);
  if (!existsSync(file)) return null;
  const source = readFileSync(file, 'utf8');
  const names = new Set();
  for (const match of source.matchAll(/^ {2}(?:async\s+)?(?:\*\s*)?([a-zA-Z]\w*)\s*\(/gm)) {
    if (match[1] !== 'constructor') names.add(match[1]);
  }
  return names;
}

function className(resource) {
  return `${resource.split('.').map(pascal).join('')}Resource`;
}

function firstParagraph(text) {
  return String(text ?? '')
    .trim()
    .split(/\n\s*\n/)[0]
    .split('\n')
    .map((line) => line.trim());
}

function paramType(p) {
  const schema = p.schema ?? { type: 'string' };
  let type = tsType(schema, 2, false);
  if (schema.type === 'array') {
    const item = tsType(schema.items, 2, false);
    type = /^[\w.]+$/.test(item) ? `${item} | readonly ${item}[]` : `${item} | ReadonlyArray<${item}>`;
  }
  if (DATE_FORMATS.has(schema['x-format'])) type = `${type} | Date`;
  return type;
}

function paramDoc(p, extra) {
  const lines = [...firstParagraph(p.description)];
  if (p.schema?.['x-format'])
    lines.push(
      `형식 ${p.schema['x-format']}${DATE_FORMATS.has(p.schema['x-format']) ? ' (Date는 KST 날짜로 변환)' : ''}`,
    );
  if (extra) lines.push(extra);
  return docBlock(lines, 2);
}

function resourcesFile() {
  // Build the tree: resource path -> { methods: [], children: Set }
  const nodes = new Map();
  const node = (path) => {
    if (!nodes.has(path)) nodes.set(path, { path, methods: [], children: new Set() });
    return nodes.get(path);
  };
  for (const o of ops) {
    const parts = o.resource.split('.');
    for (let i = 1; i < parts.length; i++)
      node(parts.slice(0, i).join('.')).children.add(parts.slice(0, i + 1).join('.'));
    node(o.resource).methods.push(o);
  }
  const roots = [...nodes.keys()].filter((p) => !p.includes('.'));
  const handwrittenRoots = new Map(roots.map((r) => [r, handWritten(r)]).filter(([, v]) => v !== null));
  const typeNames = new Set(Object.keys(schemas));

  const types = [];
  const classes = [];
  let generatedMethods = 0;
  let generatedIterators = 0;
  const skipped = [];

  for (const [path, n] of nodes) {
    const cls = className(path);
    if (typeNames.has(cls)) throw new Error(`class ${cls} clashes with a schema name`);
    const root = path.split('.')[0];
    const manual = path === root ? handwrittenRoots.get(root) : undefined;
    const members = [];
    const fields = [];
    const inits = [];
    const used = new Set();
    for (const child of [...n.children].sort()) {
      const prop = child.split('.').pop();
      if (n.methods.some((m) => m.name === prop)) throw new Error(`${child}: resource clashes with a method`);
      fields.push(`  /** \`client.${child}\` */\n  readonly ${prop}: ${className(child)};`);
      inits.push(`    this.${prop} = new ${className(child)}(transport);`);
    }
    for (const o of n.methods) {
      if (used.has(o.name)) throw new Error(`${o.resource}.${o.name}: duplicate method`);
      used.add(o.name);
      const base = pascal(o.id);
      const manualMethod = manual?.has(o.name) === true;
      const emit = (name, text) => {
        if (manualMethod) return;
        if (typeNames.has(name)) throw new Error(`generated type ${name} clashes with a schema name`);
        types.push(text);
      };
      const hasParams = o.templateNames.length + o.query.length + o.headers.length + (o.body ? 1 : 0) > 0;
      const anyRequired =
        o.templateNames.length > 0 ||
        o.query.some((p) => p.required) ||
        o.headers.some((p) => p.required) ||
        o.body?.required === true;
      // params type
      if (hasParams) {
        const lines = [];
        for (const p of o.pathParams)
          lines.push(`${paramDoc(p, '경로 값으로 URL 인코딩됩니다.')}  ${propertyKey(p.name)}: string;`);
        for (const p of o.query)
          lines.push(`${paramDoc(p)}  ${propertyKey(p.name)}${p.required ? '' : '?'}: ${paramType(p)};`);
        for (const p of o.headers)
          lines.push(
            `${paramDoc(p, '요청 헤더로 보냅니다.')}  ${propertyKey(p.name)}${p.required ? '' : '?'}: string;`,
          );
        if (o.body) {
          const bodyTypes = [o.body.json, o.body.form].filter(Boolean);
          const doc = o.body.form
            ? o.body.json
              ? '요청 본문. 파일 필드가 있으면 multipart/form-data, 없으면 JSON으로 보냅니다.'
              : '요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다.'
            : '요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다.';
          lines.push(`  /** ${doc} */\n  body${o.body.required ? '' : '?'}: ${bodyTypes.join(' | ')};`);
        }
        emit(
          `${base}Params`,
          `/** Parameters of \`${o.resource}.${o.name}\` (\`${o.id}\`). */\nexport interface ${base}Params {\n${lines.join('\n')}\n}\n`,
        );
      }
      const resultType = o.result.kind === 'void' ? 'void' : tsType(o.result.node, 0, true);
      if (o.result.kind !== 'void')
        emit(
          `${base}Result`,
          `/** Result of \`${o.resource}.${o.name}\` (\`${o.id}\`). */\nexport type ${base}Result = ${resultType};\n`,
        );
      const returns = o.result.kind === 'void' ? 'void' : `${base}Result`;
      const arg = hasParams ? `params${anyRequired ? '' : '?'}: ${base}Params` : '';
      const pass = hasParams ? 'params' : 'undefined';
      const doc = [
        ...firstParagraph(o.op.summary),
        '',
        ...firstParagraph(o.op.description),
        '',
        `\`${o.method} ${o.path}\` (\`${o.id}\`). 재시도: ${o.retry === 'safe' ? 'safe (429·5xx·네트워크 오류)' : 'rateLimitOnly (429만)'}. 속도 제한 버킷: ${o.rate}.`,
      ];
      if (o.op['x-source']) doc.push(`@see ${o.op['x-source']}`);
      if (manualMethod) {
        skipped.push(`${o.resource}.${o.name}`);
      } else {
        generatedMethods++;
        members.push(
          `${docBlock(doc, 2)}  async ${o.name}(${arg}): Promise<${returns}> {\n` +
            `    return (await callOperation(this.#transport, OPERATIONS.${o.id}, ${pass})) as ${returns};\n  }`,
        );
      }
      if (o.pagination) {
        const iterName = `iter${pascal(o.name)}`;
        if (used.has(iterName)) throw new Error(`${o.resource}.${iterName}: clashes`);
        used.add(iterName);
        const itemType = tsType(o.pagination.itemsNode, 0, true);
        if (!manual?.has(iterName))
          types.push(
            `/** One item yielded by \`${o.resource}.${iterName}\`. */\nexport type ${base}Item = ${itemType};\n`,
          );
        const omitted = `Omit<${base}Params, '${o.pagination.request}'>`;
        const iterRequired =
          o.templateNames.length > 0 ||
          o.query.some((p) => p.required && p.name !== o.pagination.request) ||
          o.headers.some((p) => p.required) ||
          o.body?.required === true;
        const stops =
          o.pagination.style === 'cursor'
            ? '`hasNext`가 false이거나 커서가 없거나 움직이지 않으면 멈춥니다.'
            : '받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.';
        if (manual?.has(iterName)) {
          skipped.push(`${o.resource}.${iterName}`);
        } else {
          generatedIterators++;
          members.push(
            `${docBlock([`Iterate over every item of \`${o.resource}.${o.name}\`, following \`${o.pagination.request}\` (${o.pagination.style}).`, stops], 2)}` +
              `  ${iterName}(params${iterRequired ? '' : '?'}: ${omitted}): AsyncGenerator<${base}Item, void, undefined> {\n` +
              `    return iterateOperation(this.#transport, OPERATIONS.${o.id}, params) as AsyncGenerator<${base}Item, void, undefined>;\n  }`,
          );
        }
      }
    }
    const doc = docBlock(
      [`\`client.${path}\`${manual ? ' (generated part; the hand-written class in src/resources extends it)' : ''}.`],
      0,
    );
    classes.push(
      `${doc}export class ${cls} {\n  readonly #transport: Transport;\n${fields.length ? `${fields.join('\n')}\n` : ''}\n` +
        `  constructor(transport: Transport) {\n    this.#transport = transport;\n${inits.length ? `${inits.join('\n')}\n` : ''}  }\n` +
        `${members.length ? `\n${members.join('\n\n')}\n` : ''}}\n`,
    );
  }

  const generatedRoots = roots.filter((r) => !handwrittenRoots.has(r)).sort();
  const clientFields = generatedRoots
    .map((r) => `  /** \`client.${r}\` */\n  readonly ${r}: ${className(r)};`)
    .join('\n');
  const clientInits = generatedRoots.map((r) => `    this.${r} = new ${className(r)}(transport);`).join('\n');
  classes.push(
    `/** Resources generated from the spec. {@link Bizgo} extends this and adds the hand-written ones (${[...handwrittenRoots.keys()].join(', ')}). */\n` +
      `export class GeneratedClient {\n${clientFields}\n\n  constructor(transport: Transport) {\n${clientInits}\n  }\n}\n`,
  );

  const text = [...types, ...classes].join('\n');
  const imports = [...typeNames].filter((name) => new RegExp(`\\b${name}\\b`).test(text)).sort();
  stats.methods = generatedMethods;
  stats.iterators = generatedIterators;
  stats.skipped = skipped;
  stats.resources = nodes.size;
  return [
    HEADER,
    '//\n',
    '// Resource classes nested per x-sdk-resource. Every method validates its params and body against the spec,\n',
    '// then calls the transport with the operation metadata from ./operations.ts.\n\n',
    "import { callOperation, iterateOperation } from '../operation.js';\n",
    "import type { Transport } from '../transport.js';\n",
    text.includes('UploadFile') ? "import type { UploadFile } from '../upload.js';\n" : '',
    "import { OPERATIONS } from './operations.js';\n",
    imports.length ? `import type {\n${imports.map((n) => `  ${n},`).join('\n')}\n} from './types.js';\n` : '',
    '\n',
    text,
  ].join('');
}

// ----------------------------------------------------------------------------------------- webhooks.ts

const SIGNATURE_HEADERS = ['X-IB-Timestamp', 'X-IB-Signature'];

function webhooksFile() {
  const rows = [];
  const methods = [];
  for (const w of webhooks) {
    // Webhooks whose spec lists the signature headers are verified; webhooks without them (counsel) are not signed.
    const signatureHeaders = w.headers.filter((h) => SIGNATURE_HEADERS.includes(h.name));
    const signed = signatureHeaders.length > 0;
    if (
      signed &&
      (signatureHeaders.length !== SIGNATURE_HEADERS.length || !signatureHeaders.every((h) => h.required))
    ) {
      throw new Error(`webhook ${w.name}: signature headers must be ${SIGNATURE_HEADERS.join(' and ')}, both required`);
    }
    const ack = w.ack === 'WebhookAck' ? 'msgKey' : w.ack === 'CounselWebhookAck' ? 'codeResult' : null;
    if (!ack) throw new Error(`webhook ${w.name}: unknown ack schema ${w.ack}`);
    rows.push(
      `  ${w.name}: ${JSON.stringify({ schema: `webhook:${w.payload}`, signature: signed ? 'required' : 'none', ack })},`,
    );
    const doc = [
      ...firstParagraph(w.op.summary),
      '',
      ...firstParagraph(w.op.description),
      '',
      signed
        ? '서명 헤더(`X-IB-Timestamp`, `X-IB-Signature`)가 반드시 있어야 하며 엄격하게 검증합니다.'
        : '상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.',
      ack === 'msgKey'
        ? '응답 본문: `receiver.ack(msgKey)`.'
        : '응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).',
      signed
        ? '@throws {@link WebhookVerificationError} 서명·시각·본문 검증에 실패했습니다(HTTP 401로 응답).'
        : '@throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).',
    ];
    methods.push(
      `${docBlock(doc, 2)}  ${w.name}(headers: WebhookHeaders, body: WebhookBody): ${w.payload} {\n` +
        `    return this.receive('${w.name}', headers, body) as ${w.payload};\n  }`,
    );
  }
  const payloads = [...new Set(webhooks.map((w) => w.payload))].sort();
  return [
    HEADER,
    '//\n',
    '// One parser per x-sdk-webhook. `signature: required` webhooks (report, MO) list X-IB-Timestamp/X-IB-Signature\n',
    '// in the spec and are always verified; `signature: none` webhooks (counsel) have no signature and are only parsed.\n\n',
    "import type { WebhookBody, WebhookHeaders } from '../webhooks.js';\n",
    `import type {\n${payloads.map((n) => `  ${n},`).join('\n')}\n} from './types.js';\n\n`,
    'export interface WebhookSpec {\n',
    '  readonly schema: string;\n',
    "  readonly signature: 'required' | 'none';\n",
    "  readonly ack: 'msgKey' | 'codeResult';\n",
    '}\n\n',
    'export const WEBHOOKS = {\n',
    rows.join('\n'),
    '\n} as const satisfies Readonly<Record<string, WebhookSpec>>;\n\n',
    '/** Every x-sdk-webhook name. */\n',
    'export type WebhookName = keyof typeof WEBHOOKS;\n\n',
    '/** Payload type per x-sdk-webhook name (the return type of `parseWebhook(name, body)`). */\n',
    `export interface WebhookPayloads {\n${webhooks.map((w) => `  ${w.name}: ${w.payload};`).join('\n')}\n}\n\n`,
    '/** Generated webhook parsers. Use {@link WebhookReceiver}, which implements `receive`. */\n',
    'export abstract class GeneratedWebhookReceiver {\n',
    '  /** Verify the signature (signed webhooks only) and parse one webhook request. */\n',
    '  protected abstract receive(name: WebhookName, headers: WebhookHeaders, body: WebhookBody): unknown;\n\n',
    methods.join('\n\n'),
    '\n}\n',
  ].join('');
}

// ---------------------------------------------------------------------------------------------- main

const stats = {};
const outputs = {
  [join(OUT, 'types.ts')]: typesFile(),
  [join(OUT, 'schemas.ts')]: schemasFile(),
  [join(OUT, 'error-codes.ts')]: errorCodesFile(),
  [join(OUT, 'operations.ts')]: operationsFile(),
  [join(OUT, 'resources.ts')]: resourcesFile(),
  [join(OUT, 'webhooks.ts')]: webhooksFile(),
};

const check = process.argv.includes('--check');
let stale = false;
// every file in src/generated must come from this script
for (const file of readdirSync(OUT)) {
  if (!Object.keys(outputs).includes(join(OUT, file))) {
    stale = true;
    console.error(`src/generated/${file} is not produced by the generator: delete it`);
  }
}
for (const [path, code] of Object.entries(outputs)) {
  let current = '';
  try {
    current = readFileSync(path, 'utf8');
  } catch {
    // missing file: treated as out of date
  }
  if (current === code) continue;
  const name = relative(ROOT, path).replaceAll('\\', '/');
  if (check) {
    stale = true;
    const a = current.split('\n');
    const b = code.split('\n');
    const line = a.findIndex((text, i) => text !== b[i]);
    console.error(`${name} is out of date (first difference at line ${line + 1})`);
  } else {
    writeFileSync(path, code, 'utf8');
    console.log(`wrote ${name}`);
  }
}
if (!check) {
  console.log(
    `${ops.length} operations, ${webhooks.length} webhooks, ${stats.resources} resources: ` +
      `${stats.methods} generated methods + ${stats.iterators} iterators; hand-written wins for ${stats.skipped.length} (${stats.skipped.join(', ')})`,
  );
}
if (stale) {
  console.error('generated code is out of date: run npm run generate');
  process.exit(1);
}
