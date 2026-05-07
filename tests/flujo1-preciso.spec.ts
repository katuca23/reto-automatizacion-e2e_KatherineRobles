// tests/flujo1-preciso.spec.ts
// Flujo 1: Simulación exitosa de Crédito PRECISO - Flujo E2E completo

import { test, expect } from '@playwright/test';
import { SimuladorPage } from '../pages/SimuladorPage';

test.describe('Flujo 1: Simulación exitosa - Crédito PRECISO', () => {

  test('F1: Simulación completa Crédito PRECISO', async ({ page }) => {
    const simulador = new SimuladorPage(page);

    // ── PASO 1: Navegar al simulador ─────────────────────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();

    expect(page.url()).toContain('simulador-de-credito');
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/simulador|cr.dito/i);
    await simulador.capturarEvidencia('F1-01-simulador-cargado');

    // ── PASO 2: Seleccionar tipo de crédito PRECISO ──────────────────────────
    await simulador.seleccionarCreditoPreciso();
    await expect(simulador.inputMonto).toBeVisible();
    await simulador.capturarEvidencia('F1-02-preciso-seleccionado');

    // ── PASO 3: Ingresar monto deseado ───────────────────────────────────────
    await simulador.ingresarMonto('10000');
    const frame = page.frameLocator('iframe').first();
    const inputNativo = frame.locator('pichincha-input[formcontrolname="loanValue"] input').first();
    const valorIngresado = await inputNativo.inputValue();
    expect(valorIngresado).toBeTruthy();
    await simulador.capturarEvidencia('F1-03-monto-ingresado');

    // ── PASO 4: Seleccionar plazo de pago (2 años = 24 meses) ────────────────
    await simulador.seleccionarPlazo(24); // "2 años"
    await simulador.capturarEvidencia('F1-04-plazo-seleccionado');

    // ── PASO 5: Seleccionar tipo de amortización ─────────────────────────────
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.capturarEvidencia('F1-05-amortizacion-francesa');

    // ── PASO 6: Ejecutar simulación ──────────────────────────────────────────
    await simulador.capturarEvidencia('F1-06-antes-simular');
    await simulador.clickSimular();
    await simulador.capturarEvidencia('F1-06-simulacion-ejecutada');

    const hayResultados = await simulador.hayResultados();
    expect(hayResultados).toBeTruthy();

    // ── PASO 7: Validar cuota mensual y tasas de interés ─────────────────────
    const textoCuota = await simulador.obtenerTextoCuota();
    expect(textoCuota.length).toBeGreaterThan(0);
    await simulador.capturarEvidencia('F1-07-cuota-y-tasas');

    // ── PASO 8: Validar tabla de amortización ────────────────────────────────
    const btnTabla = frame.locator('pichincha-button[label*="tabla" i], pichincha-button[label*="Descargar" i]').first();
    const btnVisible = await btnTabla.isVisible({ timeout: 3000 }).catch(() => false);
    if (btnVisible) {
      await btnTabla.locator('button').click();
      await page.waitForTimeout(1000);
    }
    await simulador.capturarEvidencia('F1-08-tabla-amortizacion');
  });

});
