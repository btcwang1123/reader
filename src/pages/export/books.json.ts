import type { APIRoute } from 'astro';
import { getExportData } from '../../utils/export';

export const prerender = true;

export const GET: APIRoute = async () => {
  const data = await getExportData();
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
