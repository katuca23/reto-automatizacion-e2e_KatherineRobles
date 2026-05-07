// tests/flujo5-comparacion.spec.ts
// Flujo 5: Comparación de Productos - Crédito Consumo vs Hipotecario

import { test, expect } from '@playwright/test';
import { SimuladorPage } from '../pages/SimuladorPage';
import { parseCurrencyToNumber } from '../helpers/utils';

test.describe('Flujo 5: Comparación de Productos', () => {

  test('F5: Comparación Crédito Consumo vs Hipotecario', async ({ page }) => {
    test.setTimeout(120000);
    const simulador = new SimuladorPage(page);
    const frame = page.frameLocator('iframe').first();

    // ── PASO 1: Simular crédito LINEA ABIERTA (consumo) ──────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoConsumo();
    await simulador.capturarEvidencia('F5-01-consumo-seleccionado');

    await simulador.ingresarMonto('20000');
    await simulador.seleccionarPlazo(24); // "2 años"
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoConsumo = await simulador.obtenerTextoCuota();
    const cuotaConsumo = parseCurrencyToNumber(textoConsumo);
    console.log(`Crédito Consumo $20000/24m: ${textoConsumo.substring(0, 100)}`);
    await simulador.capturarEvidencia('F5-02-resultado-consumo');

    // Capturar tasa de interés consumo
    const tasaConsumo = await frame.locator('text=/\\d+[.,]\\d+%/').first().textContent().catch(() => 'N/A');
    console.log(`Tasa consumo: ${tasaConsumo}`);

    // ── PASO 2: Simular crédito HIPOTECARIO con monto equivalente ─────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoHipotecario();
    await page.waitForTimeout(1000);
    await simulador.capturarEvidencia('F5-03-hipotecario-seleccionado');

    // Campo 1: valor vivienda
    const inputVivienda = frame.locator('pichincha-input').nth(0).locator('input').first();
    await inputVivienda.waitFor({ state: 'visible', timeout: 10000 });
    await inputVivienda.click({ clickCount: 3 });
    await inputVivienda.fill('100000');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    // Campo 2: monto deseado equivalente
    const inputPrestamo = frame.locator('pichincha-input').nth(1).locator('input').first();
    await inputPrestamo.click({ clickCount: 3 });
    await inputPrestamo.fill('20000');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    await simulador.seleccionarPlazo(24); // mismo plazo
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();

    const textoHipotecario = await simulador.obtenerTextoCuota();
    const cuotaHipotecario = parseCurrencyToNumber(textoHipotecario);
    console.log(`Crédito Hipotecario $20000/24m: ${textoHipotecario.substring(0, 100)}`);
    await simulador.capturarEvidencia('F5-04-resultado-hipotecario');

    // Capturar tasa de interés hipotecario
    const tasaHipotecario = await frame.locator('text=/\\d+[.,]\\d+%/').first().textContent().catch(() => 'N/A');
    console.log(`Tasa hipotecario: ${tasaHipotecario}`);

    // ── PASO 3: Comparar diferencias ──────────────────────────────────────────
    console.log('=== COMPARACIÓN DE PRODUCTOS ===');
    console.log(`Consumo - Cuota: $${cuotaConsumo} | Tasa: ${tasaConsumo}`);
    console.log(`Hipotecario - Cuota: $${cuotaHipotecario} | Tasa: ${tasaHipotecario}`);
    console.log(`Diferencia de cuota: $${Math.abs(cuotaConsumo - cuotaHipotecario).toFixed(2)}`);

    // Ambos productos deben tener resultados
    expect(textoConsumo.length).toBeGreaterThan(0);
    expect(textoHipotecario.length).toBeGreaterThan(0);

    // ── PASO 4: Validar diferencias en requisitos ─────────────────────────────
    // El hipotecario requiere campo adicional de vivienda — ya validado arriba
    // El consumo no requiere garantía hipotecaria
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    const inputsPreciso = await frame.locator('pichincha-input').count();
    console.log(`Campos formulario PRECISO: ${inputsPreciso}`);
    await simulador.capturarEvidencia('F5-05-campos-preciso');

    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoHipotecario();
    await page.waitForTimeout(1000);
    const inputsHipotecario = await frame.locator('pichincha-input').count();
    console.log(`Campos formulario HIPOTECARIO: ${inputsHipotecario}`);
    expect(inputsHipotecario).toBeGreaterThanOrEqual(inputsPreciso);
    await simulador.capturarEvidencia('F5-06-campos-hipotecario-mas-requisitos');
  });

});
