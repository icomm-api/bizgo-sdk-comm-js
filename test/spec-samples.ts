/**
 * Build minimal valid params for any spec operation from the spec itself (examples first, then enum values,
 * then placeholders), so every operation can be called without writing 146 fixtures by hand.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export const spec = parse(readFileSync(new URL('../spec/openapi.yaml', import.meta.url), 'utf8'));
const schemas: Record<string, any> = spec.components.schemas;
const parameters: Record<string, any> = spec.components.parameters;

export interface SpecOperation {
  id: string;
  method: string;
  path: string;
  resource: string;
  name: string;
  retry: 'safe' | 'rate_limit_only';
  pagination?: any;
  op: any;
  params: any[];
}

export const specOperations: SpecOperation[] = Object.entries(spec.paths as Record<string, any>).flatMap(
  ([path, item]) =>
    ['get', 'post', 'put', 'patch', 'delete']
      .filter((method) => item[method])
      .map((method) => {
        const op = item[method];
        const params = [...(item.parameters ?? []), ...(op.parameters ?? [])].map((p: any) =>
          p.$ref ? parameters[p.$ref.split('/').pop()] : p,
        );
        return {
          id: op.operationId,
          method: method.toUpperCase(),
          path,
          resource: op['x-sdk-resource'],
          name: op['x-sdk-method'],
          retry: op['x-sdk-retry'],
          pagination: op['x-sdk-pagination'],
          op,
          params,
        };
      }),
);

function resolve(schema: any): any {
  let node = schema;
  while (node?.$ref) node = schemas[node.$ref.split('/').pop()];
  return node;
}

function merged(schema: any): any {
  const node = resolve(schema);
  if (!node?.allOf) return node;
  const out: any = { type: 'object', properties: {}, required: [] };
  for (const part of node.allOf) {
    const m = merged(part);
    Object.assign(out.properties, m.properties ?? {});
    out.required.push(...(m.required ?? []));
  }
  return out;
}

const BYTES = new Uint8Array([0xff, 0xd8, 0xff]);

/** A value that satisfies the schema (required fields only). */
export function sample(schema: any, depth = 0): any {
  const node = merged(schema);
  if (node === undefined) return 'x';
  if (node.example !== undefined && node.type !== 'object' && node.type !== 'array') return node.example;
  if (node.oneOf) return sample(node.oneOf[0], depth + 1);
  if (node.type === 'string' && node.format === 'binary') return BYTES;
  const type = Array.isArray(node.type) ? node.type.find((t: string) => t !== 'null') : node.type;
  switch (type) {
    case 'string':
      if (node.enum) return node.enum[0];
      if (node['x-known-values']) return node['x-known-values'][0];
      if (node.pattern === '^[0-9]+$') return '1';
      if (typeof node.pattern === 'string') {
        const digits = /^\^\[0-9\]\{(\d+)\}\$$/.exec(node.pattern);
        if (digits) return '2'.repeat(Number(digits[1]));
      }
      return 'x'.repeat(Math.max(1, node.minLength ?? 1));
    case 'integer':
    case 'number':
      return node.minimum ?? 1;
    case 'boolean':
      return true;
    case 'array':
      return Array.from({ length: Math.max(1, node.minItems ?? 1) }, () => sample(node.items, depth + 1));
    case 'object': {
      if (!node.properties) return {};
      const out: Record<string, unknown> = {};
      for (const name of node.required ?? []) out[name] = sample(node.properties[name], depth + 1);
      return out;
    }
    default:
      return 'x';
  }
}

/** The spec's own request example, else a synthesized body. */
export function sampleBody(op: any): unknown {
  const content = op.requestBody?.content;
  if (!content) return undefined;
  const json = content['application/json'];
  if (json?.example !== undefined) return json.example;
  if (json?.examples) return (Object.values(json.examples)[0] as any).value;
  const [, entry] = Object.entries(content)[0] as [string, any];
  return sample(entry.schema);
}

/** Params object for a generated method: required path/query/header params and the body. */
export function sampleParams(o: SpecOperation): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const p of o.params) {
    if (p.in === 'path') params[p.name] = `${p.name.toUpperCase()}_EXAMPLE`;
    else if (p.required) params[p.name] = p.example ?? sample(p.schema);
  }
  const body = sampleBody(o.op);
  if (body !== undefined) params.body = body;
  return params;
}
