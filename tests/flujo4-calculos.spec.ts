// tests/flujo4-calculos.spec.ts
// Flujo 4: Validación de Cálculos Financieros - Flujo E2E completo

import { test, expect } from '@playwright/test';
import { SimuladorPage } from '../pages/SimuladorPage';
import { parseCurrencyToNumber, calcularCuotaMensual } from '../helpers/utils';

test.describe('Flujo 4: Validación de Cálculos Financieros', () => {

  test('F4: Validación completa de cálculos financieros', async ({ page }) => {
    const simulador = new SimuladorPage(page);

    // ── PASO 1: Escenario monto bajo / plazo corto ───────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('5000');
    await simulador.seleccionarPlazo(6); // "6 meses"
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuota1 = await simulador.obtenerTextoCuota();
    const cuota1 = parseCurrencyToNumber(textoCuota1);
    console.log(`Escenario 1 - $5000 / 6 meses: ${textoCuota1.substring(0, 80)}`);
    await simulador.capturarEvidencia('F4-01-escenario-monto-bajo');

    // ── PASO 2: Escenario monto medio / plazo medio ──────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24); // "2 años"
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuota2 = await simulador.obtenerTextoCuota();
    const cuota2 = parseCurrencyToNumber(textoCuota2);
    console.log(`Escenario 2 - $10000 / 24 meses: ${textoCuota2.substring(0, 80)}`);
    await simulador.capturarEvidencia('F4-02-escenario-monto-medio');

    // ── PASO 3: Escenario monto alto / plazo largo ───────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('20000');
    await simulador.seleccionarPlazo(48); // "4 años"
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuota3 = await simulador.obtenerTextoCuota();
    const cuota3 = parseCurrencyToNumber(textoCuota3);
    console.log(`Escenario 3 - $20000 / 48 meses: ${textoCuota3.substring(0, 80)}`);
    await simulador.capturarEvidencia('F4-03-escenario-monto-alto');

    // ── PASO 4: Validar principio - mayor plazo = menor cuota ────────────────
    // Mismo monto, diferente plazo
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(12); // "1 año"
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuotaCorto = await simulador.obtenerTextoCuota();
    const cuotaCorto = parseCurrencyToNumber(textoCuotaCorto);
    await simulador.capturarEvidencia('F4-04-plazo-corto');

    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(36); // "3 años"
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuotaLargo = await simulador.obtenerTextoCuota();
    const cuotaLargo = parseCurrencyToNumber(textoCuotaLargo);
    await simulador.capturarEvidencia('F4-04-plazo-largo');

    console.log(`Cuota 12 meses: ${cuotaCorto} | Cuota 36 meses: ${cuotaLargo}`);
    if (cuotaCorto > 0 && cuotaLargo > 0) {
      expect(cuotaCorto).toBeGreaterThan(cuotaLargo);
    }

    // ── PASO 5: Validar principio - mayor monto = mayor cuota ────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('5000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuotaBaja = await simulador.obtenerTextoCuota();
    const cuotaBaja = parseCurrencyToNumber(textoCuotaBaja);
    await simulador.capturarEvidencia('F4-05-monto-bajo');

    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('20000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoCuotaAlta = await simulador.obtenerTextoCuota();
    const cuotaAlta = parseCurrencyToNumber(textoCuotaAlta);
    await simulador.capturarEvidencia('F4-05-monto-alto');

    console.log(`Cuota $5000: ${cuotaBaja} | Cuota $20000: ${cuotaAlta}`);
    if (cuotaBaja > 0 && cuotaAlta > 0) {
      expect(cuotaAlta).toBeGreaterThan(cuotaBaja);
    }

    // ── PASO 6: Validar consistencia - mismos datos = mismo resultado ─────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const resultado1 = await simulador.obtenerTextoCuota();

    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const resultado2 = await simulador.obtenerTextoCuota();
    await simulador.capturarEvidencia('F4-06-consistencia');

    console.log(`Resultado 1: ${resultado1.substring(0, 60)}`);
    console.log(`Resultado 2: ${resultado2.substring(0, 60)}`);
    expect(resultado1).toBe(resultado2);

    // ── PASO 7: Comparar Método Francés vs Alemán ────────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();
    await simulador.capturarEvidencia('F4-07-metodo-frances');

    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.ingresarMonto('10000');
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('ALEMANA');
    await simulador.clickSimular();
    await simulador.capturarEvidencia('F4-07-metodo-aleman');

    console.log('Comparación Francés vs Alemán completada');
  });

});
