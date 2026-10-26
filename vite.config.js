import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        catalogue: resolve(root, 'catalogue/index.html'),
        structuralSteel: resolve(root, 'services/structural-steel-fabrication/index.html'),
        liftShafts: resolve(root, 'services/lift-shaft-steelwork-crash-decks/index.html'),
        industrialSheds: resolve(root, 'services/industrial-sheds-mezzanines/index.html'),
        staircasesRailingsGates: resolve(root, 'services/staircases-railings-gates/index.html'),
        customFabrication: resolve(root, 'services/custom-metal-fabrication/index.html'),
        roofingSheets: resolve(root, 'services/roofing-sheets-cladding/index.html'),
        industrialRacking: resolve(root, 'services/industrial-racking-storage/index.html'),
        unipoleStructures: resolve(root, 'services/unipole-structures-hoardings/index.html'),
        pergolasGazebos: resolve(root, 'services/pergolas-gazebos/index.html'),
        rollingShutters: resolve(root, 'services/commercial-rolling-shutters/index.html'),
        securityGrills: resolve(root, 'services/security-window-grills/index.html'),
        animalFarmSheds: resolve(root, 'services/animal-farm-sheds/index.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
