/**
 * services/databaseService.js
 * ─────────────────────────────────────────────────────────────
 * Generic, reusable database operations built on top of the Supabase client.
 *
 * This layer sits BELOW the domain services (organService.js).
 * Domain services call these helpers — they never call supabase directly.
 *
 * Architecture:
 *   Page / Hook
 *     → domain service  (organService.js)
 *       → databaseService.js
 *         → lib/supabase.js  (single client)
 *
 * Every function returns: { data, error: AppError | null }
 * ─────────────────────────────────────────────────────────────
 */

import { supabase }       from '../lib/supabase';
import { normaliseError } from '../lib/handleError';

// ─── SELECT ───────────────────────────────────────────────────────────────────

/**
 * Fetch all rows from a table.
 *
 * @param {string} table
 * @param {string} [columns='*']
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { data, error } = await getAll('organs');
 */
export async function getAll(table, columns = '*') {
  try {
    const { data, error } = await supabase.from(table).select(columns);
    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

/**
 * Fetch rows matching a filter.
 *
 * @param {string} table
 * @param {{ column: string, value: unknown }} filter
 * @param {string} [columns='*']
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { data } = await getWhere('organs', { column: 'bloodType', value: 'O+' });
 */
export async function getWhere(table, filter, columns = '*') {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq(filter.column, filter.value);

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

/**
 * Fetch a single row by its primary key (id).
 *
 * @param {string} table
 * @param {number|string} id
 * @param {string} [columns='*']
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { data } = await getById('matches', 101);
 */
export async function getById(table, id, columns = '*') {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('id', id)
      .single();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

/**
 * Insert one or more rows into a table.
 *
 * @param {string}          table
 * @param {object|object[]} payload  - Single object or array of objects
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { data, error } = await insert('donors', { fullName: 'Jane', ... });
 */
export async function insert(table, payload) {
  try {
    const rows = Array.isArray(payload) ? payload : [payload];
    const { data, error } = await supabase.from(table).insert(rows).select();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Update rows matching a filter.
 *
 * @param {string}  table
 * @param {{ column: string, value: unknown }} filter
 * @param {object}  updates  - Fields to update
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { error } = await update('matches', { column: 'id', value: 101 }, { status: 'Completed' });
 */
export async function update(table, filter, updates) {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(filter.column, filter.value)
      .select();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Delete rows matching a filter.
 *
 * @param {string} table
 * @param {{ column: string, value: unknown }} filter
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { error } = await remove('organs', { column: 'id', value: 3 });
 */
export async function remove(table, filter) {
  try {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq(filter.column, filter.value)
      .select();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── UPSERT ───────────────────────────────────────────────────────────────────

/**
 * Insert or update rows (upsert) based on a conflict column.
 *
 * @param {string}          table
 * @param {object|object[]} payload
 * @param {string}          [onConflict='id']
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { data } = await upsert('matches', { id: 101, status: 'Completed' });
 */
export async function upsert(table, payload, onConflict = 'id') {
  try {
    const rows = Array.isArray(payload) ? payload : [payload];
    const { data, error } = await supabase
      .from(table)
      .upsert(rows, { onConflict })
      .select();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── REALTIME ─────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time row changes on a table.
 * Returns the channel — pass it to `removeChannel()` in cleanup.
 *
 * @param {string}   channelName  - Unique name for this subscription
 * @param {string}   table        - Table to watch
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} event
 * @param {(payload: object) => void} callback
 * @returns {import('@supabase/supabase-js').RealtimeChannel}
 *
 * @example
 * const channel = subscribeToTable('matches-live', 'matches', '*', (payload) => {
 *   console.log('Change:', payload);
 * });
 * // cleanup:
 * removeChannel(channel);
 */
export function subscribeToTable(channelName, table, event = '*', callback) {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event, schema: 'public', table },
      callback
    )
    .subscribe((status, err) => {
      if (err) console.error(`[databaseService] Realtime error on ${table}:`, err);
      if (status === 'SUBSCRIBED') console.log(`[databaseService] Subscribed to ${table}`);
    });

  return channel;
}

/**
 * Remove and clean up a realtime channel.
 *
 * @param {import('@supabase/supabase-js').RealtimeChannel} channel
 */
export function removeChannel(channel) {
  supabase.removeChannel(channel);
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

/**
 * Fetch a paginated slice of a table, ordered by a column.
 *
 * @param {string}  table
 * @param {number}  page         - 1-based page number
 * @param {number}  [pageSize=10]
 * @param {string}  [orderBy='id']
 * @param {boolean} [ascending=true]
 * @param {string}  [columns='*']
 * @returns {Promise<{ data: Array|null, count: number|null, error: import('../lib/handleError').AppError|null }>}
 *
 * @example
 * const { data, count } = await getPaginated('organs', 1, 10, 'dateAdded', false);
 */
export async function getPaginated(
  table,
  page = 1,
  pageSize = 10,
  orderBy = 'id',
  ascending = true,
  columns = '*'
) {
  try {
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(table)
      .select(columns, { count: 'exact' })
      .order(orderBy, { ascending })
      .range(from, to);

    if (error) return { data: null, count: null, error: normaliseError(error) };
    return { data, count, error: null };
  } catch (err) {
    return { data: null, count: null, error: normaliseError(err) };
  }
}
