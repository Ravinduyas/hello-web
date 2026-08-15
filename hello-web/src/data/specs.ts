/**
 * Manufacturer specs and an honest verdict per model, transcribed from the
 * comparison and spec sheets in `command/fleet`.
 *
 * Kept separate from `fleet.ts` on purpose: the fleet itself is admin-managed
 * and arrives from the API, while this is static reference material we hold
 * only for the models we have sheets for. Anything without an entry simply
 * renders without a spec panel.
 *
 * Nothing here is invented — where a sheet gave no figure, the field is absent.
 */
export interface VehicleSpec {
  /** The one-line character from the comparison sheet. */
  headline: string;
  bestFor: string;
  specs: { label: string; value: string }[];
  pros: string[];
  cons: string[];
}

export const vehicleSpecs: Record<string, VehicleSpec> = {
  'honda-navi-110': {
    headline: 'Mini-bike hybrid',
    bestFor: 'Petite and short riders',
    specs: [
      { label: 'Transmission', value: 'Automatic' },
      { label: 'Storage', value: 'None — optional box' },
    ],
    pros: ['Fun and casual to ride', 'True motorcycle riding posture', 'Very narrow'],
    cons: ['Zero under-seat storage'],
  },

  'honda-dio-110': {
    headline: 'Trusted commuter',
    bestFor: 'Petite to average riders',
    specs: [
      { label: 'Transmission', value: 'Automatic' },
      { label: 'Seat height', value: '765 mm' },
      { label: 'Brakes', value: 'Drum, with Honda Combi Brake System' },
      { label: 'Tyres', value: '90/100-10 front and rear' },
      { label: 'Storage', value: '18 litres' },
    ],
    pros: ['Low seat height', 'Excellent fuel economy', 'Standard 18L storage', 'CBS brakes'],
    cons: [],
  },

  'yamaha-ray-zr': {
    headline: 'Smart hybrid choice',
    bestFor: 'Petite to tall riders',
    specs: [
      { label: 'Transmission', value: 'Automatic, hybrid engine' },
      { label: 'Weight', value: '99 kg — the lightest we rent' },
      { label: 'Storage', value: '21 litres' },
    ],
    pros: ['Lightest in the fleet', 'Punchy hybrid engine', 'Great knee clearance', 'Max storage 21L'],
    cons: [],
  },

  'tvs-ntorq-125': {
    headline: 'Performance king',
    bestFor: 'Average to big and tall riders',
    specs: [
      { label: 'Engine', value: '124.8 cc single, CVTi' },
      { label: 'Torque', value: '10.5 Nm @ 5,500 rpm' },
      { label: 'Brakes', value: 'Front disc 220mm / rear drum 130mm, synchronised braking' },
      { label: 'Tyres', value: 'Front 100/80-12 · Rear 110/80-12' },
      { label: 'Fuel tank', value: '5.8 litres' },
      { label: 'Storage', value: '22 litres — the largest' },
    ],
    pros: [
      'Class-leading tech, digital console with Bluetooth',
      'Distinctive sporty looks',
      'Strong city performance and pick-up',
      'Widest tyres of our scooters',
    ],
    cons: [
      'Fuel economy could be better for a 125',
      'Stiff suspension on rough roads',
      'Slightly heavier than some rivals',
    ],
  },

  'bajaj-pulsar': {
    headline: 'The distance bike',
    bestFor: 'Experienced riders, mountain roads and long days',
    specs: [
      { label: 'Engine', value: '160.3 cc, 4-valve' },
      { label: 'Torque', value: '14.6 Nm @ 7,250 rpm' },
      { label: 'Brakes', value: 'Single-channel ABS, front disc, rear disc or drum' },
      { label: 'Tyres', value: 'Front 90/90-17 · Rear 120/80-17' },
      { label: 'Fuel tank', value: '12 litres' },
      { label: 'Frame', value: 'Perimeter frame' },
    ],
    pros: [
      'Class-leading power and performance',
      'Smooth 4-valve engine',
      'Excellent fuel efficiency for its class',
      'Strong brakes and safety options',
    ],
    cons: [
      'Higher maintenance cost than a 125–150',
      'Heavier than some rivals',
      'Plastics feel average',
      'Pillion comfort could be better on very long rides',
    ],
  },

  'bajaj-re-tuktuk': {
    headline: 'The one that never stops',
    bestFor: 'Three adults, luggage, and rain',
    specs: [
      { label: 'Engine', value: '199 cc / 236 cc 4-stroke' },
      { label: 'Power', value: '9.5–10.2 hp @ 5,000 rpm' },
      { label: 'Brakes', value: 'Hydraulic drum' },
      { label: 'Tyres', value: '4.00-8, 4PR/6PR (interchangeable)' },
      { label: 'Luggage', value: '60–80 litres' },
      { label: 'Seating', value: 'Bench for three adults, high roof' },
    ],
    pros: ['Legendary reliability', 'Cheap and plentiful parts', 'Excellent balance'],
    cons: ['No under-seat lockers', 'Manual — the clutch is on the handlebar'],
  },
};

export const getSpec = (bikeId: string): VehicleSpec | undefined => vehicleSpecs[bikeId];
