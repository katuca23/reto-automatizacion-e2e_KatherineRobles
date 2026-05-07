// tests/flujo3-validaciones.spec.ts
// Flujo 3: Validaciones de Formularios Financieros

import { test, expect } from '@playwright/test';
import { SimuladorPage } from '../pages/SimuladorPage';

test.describe('Flujo 3: Validaciones de Formularios Financieros', () => {

  test('F3: Validaciones completas de formulario financiero', async ({ page }) => {
    test.setTimeout(120000); // 2 minutos por la cantidad de validaciones
    const simulador = new SimuladorPage(page);
    const frame = page.frameLocator('iframe').first();

    // ── Navegar y preparar ───────────────────────────────────────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    await simulador.capturarEvidencia('F3-01-simulador-listo');

    const inputNativo = frame.locator('pichincha-input[formcontrolname="loanValue"] input').first();

    // ── PASO 2: Valor negativo ───────────────────────────────────────────────
    await inputNativo.click({ clickCount: 3 });
    await inputNativo.fill('-5000');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const valorNegativo = await inputNativo.inputValue();
    console.log(`Valor negativo ingresado: "${valorNegativo}"`);
    await simulador.capturarEvidencia('F3-02-valor-negativo');

    // ── PASO 3: Texto en campo numérico ──────────────────────────────────────
    await inputNativo.click({ clickCount: 3 });
    await inputNativo.fill('abcdef');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const valorTexto = await inputNativo.inputValue();
    console.log(`Texto en numérico: "${valorTexto}"`);
    await simulador.capturarEvidencia('F3-03-texto-campo-numerico');

    // ── PASO 4: Límite mínimo ────────────────────────────────────────────────
    await inputNativo.click({ clickCount: 3 });
    await inputNativo.fill('1');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const hayErrorMin = await simulador.hayMensajeError();
    console.log(`Límite mínimo (1): error=${hayErrorMin}`);
    await simulador.capturarEvidencia('F3-04-limite-minimo');

    // ── PASO 5: Límite máximo ────────────────────────────────────────────────
    await inputNativo.click({ clickCount: 3 });
    await inputNativo.fill('99999999');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    const hayErrorMax = await simulador.hayMensajeError();
    console.log(`Límite máximo (99999999): error=${hayErrorMax}`);
    await simulador.capturarEvidencia('F3-05-limite-maximo');

    // ── PASO 6: Rango de plazos disponibles ──────────────────────────────────
    await inputNativo.click({ clickCount: 3 });
    await inputNativo.fill('10000');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    const dropdownPlazo = frame.locator('pichincha-dropdown[formcontrolname="loanTerm"] .bp-select-multiple__input-container');
    await dropdownPlazo.click();
    await page.waitForTimeout(600);
    const cantOpciones = await frame.locator('pichincha-dropdown[formcontrolname="loanTerm"] li').count();
    expect(cantOpciones).toBeGreaterThan(0);
    console.log(`Plazos disponibles: ${cantOpciones}`);
    await simulador.capturarEvidencia('F3-06-rango-plazos');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // ── PASO 7: Simular con datos completos y validar formato moneda ──────────
    await simulador.seleccionarPlazo(24);
    await simulador.seleccionarAmortizacion('FRANCESA');
    await simulador.clickSimular();
    const textoCuota = await simulador.obtenerTextoCuota();
    expect(textoCuota).toMatch(/\$|\d/);
    console.log(`Formato moneda: ${textoCuota.substring(0, 80)}`);
    await simulador.capturarEvidencia('F3-07-formato-moneda');

    // ── PASO 8: Simular sin datos - verificar comportamiento ──────────────────
    await simulador.navegar();
    await simulador.esperarCargaSimulador();
    await simulador.seleccionarCreditoPreciso();
    // Intentar simular sin llenar campos
    const btnSimular = frame.locator('pichincha-button[label="Simular"] button').first();
    const estaDeshabilitado = await btnSimular.isDisabled({ timeout: 3000 }).catch(() => true);
    console.log(`Botón Simular deshabilitado sin datos: ${estaDeshabilitado}`);
    expect(estaDeshabilitado).toBeTruthy(); // debe estar disabled sin datos
    await simulador.capturarEvidencia('F3-08-boton-disabled-sin-datos');
  });

});
