// tests/flujo2-hipotecario.spec.ts
// Flujo 2: Simulación exitosa de Crédito HIPOTECARIO VIVIENDA

import { test, expect } from '@playwright/test';
import { SimuladorPage } from '../pages/SimuladorPage';

test.describe('Flujo 2: Simulación exitosa - Crédito HIPOTECARIO VIVIENDA', () => {

  test('F2: Simulación completa Crédito HIPOTECARIO VIVIENDA', async ({ page }) => {
    const simulador = new SimuladorPage(page);
    const frame = page.frameLocator('iframe').first();

    // ── PASO 1: Navegar al simulador ─────────────────────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    expect(page.url()).toContain('simulador-de-credito');
    await simulador.capturarEvidencia('F2-01-simulador-cargado');

    // ── PASO 2: Seleccionar tipo de crédito HIPOTECARIO VIVIENDA ─────────────
    await simulador.seleccionarCreditoHipotecario();
    await page.waitForTimeout(1000);
    await simulador.capturarEvidencia('F2-02-hipotecario-seleccionado');

    // ── PASO 3: Ingresar monto vivienda (¿Cuánto cuesta la vivienda?) ─────────
    // Campo propertyValue - primer input del formulario hipotecario
    const inputVivienda = frame.locator('pichincha-input').nth(0).locator('input').first();
    await inputVivienda.waitFor({ state: 'visible', timeout: 10000 });
    await inputVivienda.click({ clickCount: 3 });
    await inputVivienda.fill('100000');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await simulador.capturarEvidencia('F2-03-monto-vivienda-ingresado');

    // ── PASO 4: Ingresar monto deseado (¿Cuánto dinero necesitas?) ────────────
    // Campo loanValue - segundo input del formulario hipotecario
    const inputPrestamo = frame.locator('pichincha-input').nth(1).locator('input').first();
    await inputPrestamo.waitFor({ state: 'visible', timeout: 10000 });
    await inputPrestamo.click({ clickCount: 3 });
    await inputPrestamo.fill('80000');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await simulador.capturarEvidencia('F2-04-monto-prestamo-ingresado');

    // ── PASO 5: Seleccionar plazo de pago ────────────────────────────────────
    await simulador.seleccionarPlazo(120); // "10 años"
    await simulador.capturarEvidencia('F2-05-plazo-seleccionado');

    // ── PASO 6: Seleccionar tipo de amortización ─────────────────────────────
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.capturarEvidencia('F2-06-amortizacion-seleccionada');

    // ── PASO 7: Ejecutar simulación ──────────────────────────────────────────
    await simulador.capturarEvidencia('F2-07-antes-simular');
    await simulador.clickSimular();
    await simulador.capturarEvidencia('F2-07-simulacion-ejecutada');

    const hayResultados = await simulador.hayResultados();
    expect(hayResultados).toBeTruthy();

    // ── PASO 8: Validar cuota mensual y tasas de interés ─────────────────────
    const textoCuota = await simulador.obtenerTextoCuota();
    expect(textoCuota.length).toBeGreaterThan(0);
    console.log(`Cuota hipotecaria: ${textoCuota.substring(0, 100)}`);
    await simulador.capturarEvidencia('F2-08-cuota-y-tasas');

    // ── PASO 9: Validar tabla de amortización ────────────────────────────────
    const linkTabla = frame.locator('text=Ver tabla de amortización').first();
    const linkVisible = await linkTabla.isVisible({ timeout: 3000 }).catch(() => false);
    if (linkVisible) {
      await linkTabla.click();
      await page.waitForTimeout(1000);
    }
    await simulador.capturarEvidencia('F2-09-tabla-amortizacion');
  });

});
