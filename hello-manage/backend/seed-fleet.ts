/**
 * Syncs an existing database onto the canonical fleet in `fleet-data.ts`.
 *
 * The seeds in `store.ts` only fire on an empty table, so a database that
 * already holds the old demo fleet never picks up the real vehicles or the
 * euro prices. Run this once to bring it in line:
 *
 *     npm run seed:fleet
 *
 * It is safe to run repeatedly — everything is an upsert.
 *
 * Vehicles that are no longer rented are **deactivated, never deleted**: old
 * bookings reference their bike id, and deleting the row would orphan them.
 * Deactivated models disappear from the public site but stay in the admin.
 */
import './env.ts';
import {
  addBike,
  addCategory,
  addExtra,
  getBikeById,
  getExtra,
  listBikes,
  listCategories,
  listExtras,
  updateBike,
  updateExtra,
} from './store.ts';
import { FLEET_BIKES, FLEET_CATEGORIES, FLEET_EXTRAS } from './fleet-data.ts';

let added = 0;
let updated = 0;
let retired = 0;

/* ---- Categories -------------------------------------------------- */
const existingCategories = new Set(listCategories().map(c => c.name));
for (const name of FLEET_CATEGORIES) {
  if (!existingCategories.has(name)) {
    addCategory(name);
    console.log(`  + category  ${name}`);
  }
}

/* ---- Bikes ------------------------------------------------------- */
for (const bike of FLEET_BIKES) {
  const current = getBikeById(bike.id);
  if (current) {
    updateBike(bike.id, { ...bike, active: true });
    updated++;
    const priceChanged = current.pricePerDay !== bike.pricePerDay;
    console.log(
      `  ~ bike      ${bike.title}` +
        (priceChanged ? `  (${current.pricePerDay} -> €${bike.pricePerDay}/day)` : ''),
    );
  } else {
    addBike({ ...bike, active: true });
    added++;
    console.log(`  + bike      ${bike.title}  €${bike.pricePerDay}/day`);
  }
}

const keepBikes = new Set(FLEET_BIKES.map(b => b.id));
for (const bike of listBikes()) {
  if (!keepBikes.has(bike.id) && bike.active) {
    updateBike(bike.id, { active: false });
    retired++;
    console.log(`  - retired   ${bike.title}  (deactivated, bookings kept)`);
  }
}

/* ---- Extras ------------------------------------------------------ */
for (const extra of FLEET_EXTRAS) {
  if (getExtra(extra.id)) {
    updateExtra(extra.id, { ...extra, active: true });
    console.log(`  ~ extra     ${extra.label}  €${extra.price}`);
  } else {
    addExtra({ ...extra, active: true });
    console.log(`  + extra     ${extra.label}  €${extra.price}`);
  }
}

const keepExtras = new Set(FLEET_EXTRAS.map(e => e.id));
for (const extra of listExtras()) {
  if (!keepExtras.has(extra.id) && extra.active) {
    updateExtra(extra.id, { active: false });
    console.log(`  - retired   ${extra.label}  (deactivated)`);
  }
}

console.log(
  `\nFleet synced — ${added} added, ${updated} updated, ${retired} retired. ` +
    `${FLEET_CATEGORIES.length} categories, all prices in EUR.`,
);
